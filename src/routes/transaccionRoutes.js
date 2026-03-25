const express = require("express");
const router = express.Router();
const transaccionController = require("../controllers/transaccionControler");

// Crear una nueva transacción
router.post("/", transaccionController.crearTransaccion);

// Obtener todas las transacciones de un usuario
router.get("/:idUsuario", transaccionController.obtenerTransacciones);

// Eliminar una transacción
router.delete("/:idTransaccion", transaccionController.eliminarTransaccion);

module.exports = router;

