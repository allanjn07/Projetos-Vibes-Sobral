const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Token não fornecido." });

  try {
    req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user?.role !== "admin")
    return res.status(403).json({ error: "Acesso restrito a administradores." });
  next();
}

module.exports = { authMiddleware, adminMiddleware };
