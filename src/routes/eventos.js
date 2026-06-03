const express = require("express");
const router = express.Router();
const { listar, buscarPorId, criar, atualizar, deletar } = require("../controllers/eventosController");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

router.get("/", listar);
router.get("/:id", buscarPorId);
router.post("/", authMiddleware, adminMiddleware, criar);
router.put("/:id", authMiddleware, adminMiddleware, atualizar);
router.delete("/:id", authMiddleware, adminMiddleware, deletar);

module.exports = router;
