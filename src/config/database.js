require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sobral_vibe",
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.query("SET NAMES utf8mb4");
    console.log("✅ Conectado ao MySQL!");
    conn.release();
  } catch (err) {
    console.error("❌ Erro ao conectar no MySQL:", err.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
