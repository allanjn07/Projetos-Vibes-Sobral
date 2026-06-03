const { pool } = require("../config/database");

async function listar(req, res) {
  const { categoria, busca, data } = req.query;
  let sql = "SELECT * FROM eventos WHERE 1=1";
  const params = [];

  if (categoria && categoria !== "hoje") {
    sql += " AND categoria = ?";
    params.push(categoria);
  }
  if (busca) {
    sql += " AND (titulo LIKE ? OR local LIKE ?)";
    params.push(`%${busca}%`, `%${busca}%`);
  }
  if (data) {
    sql += " AND DATE(data_evento) = ?";
    params.push(data);
  } else if (categoria === "hoje") {
    sql += " AND DATE(data_evento) = CURDATE()";
  }

  sql += " ORDER BY data_evento ASC";

  try {
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar eventos." });
  }
}

async function buscarPorId(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM eventos WHERE id = ?", [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Evento não encontrado." });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar evento." });
  }
}

async function criar(req, res) {
  const { titulo, categoria, local, horario, data_evento, tipo, preco, link_ingresso, imagem_url } = req.body;
  if (!titulo || !categoria || !local || !horario || !data_evento)
    return res.status(400).json({ error: "Campos obrigatórios: titulo, categoria, local, horario, data_evento." });

  try {
    const [result] = await pool.query(
      `INSERT INTO eventos (titulo, categoria, local, horario, data_evento, tipo, preco, link_ingresso, imagem_url, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, categoria, local, horario, data_evento, tipo || "info", preco || null, link_ingresso || null, imagem_url || null, req.user.id]
    );
    return res.status(201).json({ message: "Evento criado com sucesso!", id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar evento." });
  }
}

async function atualizar(req, res) {
  const { id } = req.params;
  const { titulo, categoria, local, horario, data_evento, tipo, preco, link_ingresso, imagem_url } = req.body;

  try {
    const [rows] = await pool.query("SELECT id FROM eventos WHERE id = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Evento não encontrado." });

    await pool.query(
      `UPDATE eventos SET titulo=?, categoria=?, local=?, horario=?, data_evento=?, tipo=?, preco=?, link_ingresso=?, imagem_url=? WHERE id=?`,
      [titulo, categoria, local, horario, data_evento, tipo, preco, link_ingresso, imagem_url, id]
    );
    return res.json({ message: "Evento atualizado com sucesso!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar evento." });
  }
}

async function deletar(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT id FROM eventos WHERE id = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Evento não encontrado." });

    await pool.query("DELETE FROM eventos WHERE id = ?", [id]);
    return res.json({ message: "Evento deletado com sucesso!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao deletar evento." });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };
