const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");

async function register(req, res) {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });

  try {
    const [existing] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(409).json({ error: "E-mail já cadastrado." });

    const hash = await bcrypt.hash(senha, 10);
    const [result] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, 'user')",
      [nome, email, hash]
    );

    const token = jwt.sign(
      { id: result.insertId, email, nome, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(201).json({
      message: "Usuário criado com sucesso!",
      token,
      usuario: { id: result.insertId, nome, email, role: "user" },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function login(req, res) {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(401).json({ error: "Credenciais inválidas." });

    const usuario = rows[0];
    if (!(await bcrypt.compare(senha, usuario.senha)))
      return res.status(401).json({ error: "Credenciais inválidas." });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      message: "Login realizado com sucesso!",
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function perfil(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, email, role, criado_em FROM usuarios WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado." });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
}

module.exports = { register, login, perfil };
