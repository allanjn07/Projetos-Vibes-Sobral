const { pool } = require("../config/database");

async function listar(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.texto, c.criado_em, u.nome AS autor
       FROM comentarios c
       JOIN usuarios u ON u.id = c.usuario_id
       WHERE c.evento_id = ?
       ORDER BY c.criado_em DESC`,
      [id]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar comentários." });
  }
}

async function criar(req, res) {
  const { id } = req.params;
  const { texto } = req.body;

  if (!texto || texto.trim() === "")
    return res.status(400).json({ error: "O comentário não pode estar vazio." });

  try {
    const [evento] = await pool.query("SELECT id FROM eventos WHERE id = ?", [id]);
    if (evento.length === 0)
      return res.status(404).json({ error: "Evento não encontrado." });

    const [result] = await pool.query(
      "INSERT INTO comentarios (evento_id, usuario_id, texto) VALUES (?, ?, ?)",
      [id, req.user.id, texto.trim()]
    );

    return res.status(201).json({
      message: "Comentário adicionado!",
      comentario: {
        id: result.insertId,
        texto: texto.trim(),
        autor: req.user.nome,
        criado_em: new Date(),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar comentário." });
  }
}

async function deletar(req, res) {
  const { comentarioId } = req.params;
  try {
    const [rows] = await pool.query("SELECT usuario_id FROM comentarios WHERE id = ?", [comentarioId]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Comentário não encontrado." });

    if (req.user.role !== "admin" && rows[0].usuario_id !== req.user.id)
      return res.status(403).json({ error: "Sem permissão para deletar este comentário." });

    await pool.query("DELETE FROM comentarios WHERE id = ?", [comentarioId]);
    return res.json({ message: "Comentário deletado." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao deletar comentário." });
  }
}

module.exports = { listar, criar, deletar };
