const express = require("express");
const router = express.Router();
const notaController = require("../controllers/notaController");

// IMPORTANTE: El orden de las rutas es crucial en Express
// Las rutas más específicas deben ir antes que las generales

// Crear una nueva nota (debe ir antes de las rutas con parámetros)
router.post("/", notaController.crearNota);

// Obtener una nota específica (más específica, va antes)
router.get("/:idUsuario/:idNota", notaController.obtenerNota);

// Obtener todas las notas de un usuario (menos específica, va después)
router.get("/:idUsuario", notaController.obtenerNotas);

// Actualizar una nota
router.put("/:idNota", notaController.actualizarNota);

// Eliminar una nota
router.delete("/:idNota", notaController.eliminarNota);

module.exports = router;
