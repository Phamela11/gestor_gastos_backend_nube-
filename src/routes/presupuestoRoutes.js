const express = require("express");
const router = express.Router();
const presupuestoController = require("../controllers/presupuestoControler");

// Las rutas más específicas deben ir antes que las generales

// Crear un nuevo presupuesto
router.post("/", presupuestoController.crearPresupuesto);

// Obtener un presupuesto por ID (más específico)
router.get(
  "/:idUsuario/:idPresupuesto",
  presupuestoController.obtenerPresupuesto
);

// Obtener todos los presupuestos de un usuario
router.get("/:idUsuario", presupuestoController.obtenerPresupuestos);

// Actualizar un presupuesto
router.put("/:idPresupuesto", presupuestoController.actualizarPresupuesto);

// Eliminar un presupuesto
router.delete("/:idPresupuesto", presupuestoController.eliminarPresupuesto);

module.exports = router;
