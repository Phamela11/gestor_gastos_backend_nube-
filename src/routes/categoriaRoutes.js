const express = require("express");
const router = express.Router();
const categoriaController = require("../controllers/categoriaControler");

// IMPORTANTE: El orden de las rutas es crucial en Express
// Las rutas más específicas deben ir antes que las generales

// Crear una nueva categoría (debe ir antes de las rutas con parámetros)
router.post("/", categoriaController.crearCategoria);

// Obtener una categoría específica (más específica, va antes)
router.get("/:idUsuario/:idCategoria", categoriaController.obtenerCategoria);

// Obtener todas las categorías de un usuario (menos específica, va después)
router.get("/:idUsuario", categoriaController.obtenerCategorias);

// Actualizar una categoría
router.put("/:idCategoria", categoriaController.actualizarCategoria);

// Eliminar una categoría
router.delete("/:idCategoria", categoriaController.eliminarCategoria);

module.exports = router;

