const presupuestoService = require("../services/presupuestoService");

const presupuestoController = {
  /**
   * GET /api/presupuestos/:idUsuario
   */
  obtenerPresupuestos: async (req, res) => {
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

      const presupuestos =
        await presupuestoService.obtenerPresupuestosPorUsuario(idUsuarioNum);

      res.json({
        success: true,
        presupuestos,
      });
    } catch (error) {
      console.error("Error al obtener presupuestos:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener presupuestos",
        error: error.message,
      });
    }
  },

  /**
   * GET /api/presupuestos/:idUsuario/:idPresupuesto
   */
  obtenerPresupuesto: async (req, res) => {
    try {
      const { idUsuario, idPresupuesto } = req.params;

      const idUsuarioNum = parseInt(idUsuario, 10);
      const idPresupuestoNum = parseInt(idPresupuesto, 10);

      if (isNaN(idUsuarioNum) || isNaN(idPresupuestoNum)) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      const presupuesto = await presupuestoService.obtenerPresupuestoPorId(
        idPresupuestoNum,
        idUsuarioNum
      );

      if (!presupuesto) {
        return res.status(404).json({
          success: false,
          message: "Presupuesto no encontrado",
        });
      }

      res.json({
        success: true,
        presupuesto,
      });
    } catch (error) {
      console.error("Error al obtener presupuesto:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener presupuesto",
        error: error.message,
      });
    }
  },

  /**
   * POST /api/presupuestos
   */
  crearPresupuesto: async (req, res) => {
    try {
      const {
        id_usuario,
        id_categoria,
        monto_limite,
        fecha_inicio,
        fecha_fin,
      } = req.body;

      if (
        id_usuario == null ||
        id_categoria == null ||
        monto_limite == null ||
        !fecha_inicio ||
        !fecha_fin
      ) {
        return res.status(400).json({
          success: false,
          message:
            "id_usuario, id_categoria, monto_limite, fecha_inicio y fecha_fin son requeridos",
        });
      }

      const idUsuarioNum = parseInt(id_usuario, 10);
      const idCategoriaNum = parseInt(id_categoria, 10);
      const montoLimiteNum = Number(monto_limite);

      if (isNaN(idUsuarioNum) || isNaN(idCategoriaNum)) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      if (Number.isNaN(montoLimiteNum) || montoLimiteNum < 0) {
        return res.status(400).json({
          success: false,
          message: "monto_limite debe ser un número positivo",
        });
      }

      const nuevoPresupuesto = await presupuestoService.crearPresupuesto({
        id_usuario: idUsuarioNum,
        id_categoria: idCategoriaNum,
        monto_limite: montoLimiteNum,
        fecha_inicio,
        fecha_fin,
      });

      res.status(201).json({
        success: true,
        presupuesto: nuevoPresupuesto,
        message: "Presupuesto creado exitosamente",
      });
    } catch (error) {
      if (error.code === "PRESUPUESTO_DUPLICADO_CATEGORIA") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      console.error("Error al crear presupuesto:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear presupuesto",
        error: error.message,
      });
    }
  },

  /**
   * PUT /api/presupuestos/:idPresupuesto
   */
  actualizarPresupuesto: async (req, res) => {
    try {
      const { idPresupuesto } = req.params;
      const {
        id_usuario,
        id_categoria,
        monto_limite,
        fecha_inicio,
        fecha_fin,
      } = req.body;

      if (
        !id_usuario ||
        id_categoria == null ||
        monto_limite == null ||
        !fecha_inicio ||
        !fecha_fin
      ) {
        return res.status(400).json({
          success: false,
          message:
            "id_usuario, id_categoria, monto_limite, fecha_inicio y fecha_fin son requeridos",
        });
      }

      const idPresupuestoNum = parseInt(idPresupuesto, 10);
      const idUsuarioNum = parseInt(id_usuario, 10);
      const idCategoriaNum = parseInt(id_categoria, 10);
      const montoLimiteNum = Number(monto_limite);

      if (
        isNaN(idPresupuestoNum) ||
        isNaN(idUsuarioNum) ||
        isNaN(idCategoriaNum)
      ) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      if (Number.isNaN(montoLimiteNum) || montoLimiteNum < 0) {
        return res.status(400).json({
          success: false,
          message: "monto_limite debe ser un número positivo",
        });
      }

      const presupuestoActualizado =
        await presupuestoService.actualizarPresupuesto(
          idPresupuestoNum,
          idUsuarioNum,
          {
            id_categoria: idCategoriaNum,
            monto_limite: montoLimiteNum,
            fecha_inicio,
            fecha_fin,
          }
        );

      if (!presupuestoActualizado) {
        return res.status(404).json({
          success: false,
          message: "Presupuesto no encontrado",
        });
      }

      res.json({
        success: true,
        presupuesto: presupuestoActualizado,
        message: "Presupuesto actualizado exitosamente",
      });
    } catch (error) {
      if (error.code === "PRESUPUESTO_DUPLICADO_CATEGORIA") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      console.error("Error al actualizar presupuesto:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar presupuesto",
        error: error.message,
      });
    }
  },

  /**
   * DELETE /api/presupuestos/:idPresupuesto
   */
  eliminarPresupuesto: async (req, res) => {
    try {
      const { idPresupuesto } = req.params;
      const { id_usuario } = req.body;

      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: "id_usuario es requerido",
        });
      }

      const idPresupuestoNum = parseInt(idPresupuesto, 10);
      const idUsuarioNum = parseInt(id_usuario, 10);

      if (isNaN(idPresupuestoNum) || isNaN(idUsuarioNum)) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      const presupuestoEliminado =
        await presupuestoService.eliminarPresupuesto(
          idPresupuestoNum,
          idUsuarioNum
        );

      if (!presupuestoEliminado) {
        return res.status(404).json({
          success: false,
          message: "Presupuesto no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Presupuesto eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar presupuesto:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar presupuesto",
        error: error.message,
      });
    }
  },
};

module.exports = presupuestoController;
