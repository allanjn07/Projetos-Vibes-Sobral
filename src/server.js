require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { testConnection } = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/eventos", require("./routes/eventos"));
app.use("/api/eventos/:id/comentarios", require("./routes/comentarios"));

app.get("/api", (req, res) => res.json({ message: "🟠 Sobral Vibe API rodando!" }));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}`);
  });
});
