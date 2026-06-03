const express = require("express");
const router = express.Router({ mergeParams: true });
const { listar, criar, deletar } = require("../controllers/comentariosController");
const { authMiddleware } = require("../middlewares/auth");

router.get("/", listar);
router.post("/", authMiddleware, criar);
router.delete("/:comentarioId", authMiddleware, deletar);

module.exports = router;
