const express = require("express");
const router = express.Router();

const { mensaje, login , register } = require("../controllers/testcontroller");
const categoriaRoutes = require("./categoriaRoutes");
const transaccionRoutes = require("./transaccionRoutes");
const presupuestoRoutes = require("./presupuestoRoutes");
const notaRoutes = require("./notaRoutes");

// Rutas de API primero (orden importa en Express)
router.use("/api/categorias", categoriaRoutes);
router.use("/api/transacciones", transaccionRoutes);
router.use("/api/presupuestos", presupuestoRoutes);
router.use("/api/notas", notaRoutes);

// Ruta de prueba (debug)
router.get("/api/transacciones-test", (req, res) => {
  res.json({ success: true, message: "transacciones routes index OK" });
});

router.get("/", mensaje);
router.post("/login", login);
router.post("/register", register);

module.exports = router;
