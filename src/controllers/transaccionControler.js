const transaccionServices = require("../services/transaccionServices");
const presupuestoService = require("../services/presupuestoService");

const transaccionController = {
  // GET /api/transacciones/:idUsuario
  obtenerTransacciones: async (req, res) => {
    try {
      const { idUsuario } = req.params;

      if (!idUsuario) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario es requerido",
        });
      }

      const idUsuarioNum = parseInt(idUsuario, 10);
      if (isNaN(idUsuarioNum)) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario inválido",
        });
      }

      const transacciones =
        await transaccionServices.obtenerTransaccionesPorUsuario(idUsuarioNum);

      res.json({
        success: true,
        transacciones,
      });
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener transacciones",
        error: error.message,
      });
    }
  },

  // POST /api/transacciones
  crearTransaccion: async (req, res) => {
    try {
      const { id_usuario, id_categoria, monto, descripcion } = req.body;

      if (id_usuario == null || id_categoria == null || monto == null) {
        return res.status(400).json({
          success: false,
          message: "id_usuario, id_categoria y monto son requeridos",
        });
      }

      const idUsuarioNum = parseInt(id_usuario, 10);
      const idCategoriaNum = parseInt(id_categoria, 10);
      const montoNum = Number(monto);

      if (isNaN(idUsuarioNum) || isNaN(idCategoriaNum)) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      if (Number.isNaN(montoNum)) {
        return res.status(400).json({
          success: false,
          message: "Monto inválido",
        });
      }

      const nuevaTransaccion = await transaccionServices.crearTransaccion({
        id_usuario: idUsuarioNum,
        id_categoria: idCategoriaNum,
        monto: montoNum,
        descripcion,
      });

      // Verificación opcional de presupuesto (no bloquea la creación)
      let presupuestoSuperado = false;
      try {
        const fechaRegistro =
          nuevaTransaccion.fecha_registro || new Date().toISOString();
        console.log("📅 Fecha registro:", fechaRegistro);
        console.log("👤 ID Usuario:", idUsuarioNum);
        console.log("📂 ID Categoría:", idCategoriaNum);
        
        const resultado =
          await presupuestoService.verificarPresupuestoAlCrearTransaccion(
            idUsuarioNum,
            idCategoriaNum,
            fechaRegistro
          );
        console.log("✅ Resultado verificación presupuesto:", resultado);
        presupuestoSuperado = resultado.presupuesto_superado === true;
      } catch (err) {
        console.error("Error al verificar presupuesto (transacción ya creada):", err);
      }

      const payload = {
        success: true,
        transaccion: nuevaTransaccion,
        message: "Transacción creada exitosamente",
      };
      if (presupuestoSuperado) {
        payload.presupuesto_superado = true;
        payload.mensaje_presupuesto = "¡Atención! Esta transacción supera el presupuesto establecido para esta categoría.";
      }

      res.status(201).json(payload);
    } catch (error) {
      console.error("Error al crear transacción:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear transacción",
        error: error.message,
      });
    }
  },

  // DELETE /api/transacciones/:idTransaccion
  eliminarTransaccion: async (req, res) => {
    try {
      const { idTransaccion } = req.params;
      const { id_usuario } = req.body;

      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: "id_usuario es requerido",
        });
      }

      const idTransaccionNum = parseInt(idTransaccion, 10);
      const idUsuarioNum = parseInt(id_usuario, 10);

      if (isNaN(idTransaccionNum) || isNaN(idUsuarioNum)) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      const transaccionEliminada = await transaccionServices.eliminarTransaccion(
        idTransaccionNum,
        idUsuarioNum
      );

      if (!transaccionEliminada) {
        return res.status(404).json({
          success: false,
          message: "Transacción no encontrada",
        });
      }

      res.json({
        success: true,
        message: "Transacción eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar transacción:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar transacción",
        error: error.message,
      });
    }
  },
};

module.exports = transaccionController;

