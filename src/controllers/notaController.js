const notaService = require("../services/notaService");

const notaController = {
  // GET /api/notas/:idUsuario
  obtenerNotas: async (req, res) => {
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

      const notas = await notaService.obtenerNotasPorUsuario(idUsuarioNum);

      res.json({
        success: true,
        notas,
      });
    } catch (error) {
      console.error("Error al obtener notas:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener notas",
        error: error.message,
      });
    }
  },

  // GET /api/notas/:idUsuario/:idNota
  obtenerNota: async (req, res) => {
    try {
      const { idUsuario, idNota } = req.params;

      const idUsuarioNum = parseInt(idUsuario, 10);
      const idNotaNum = parseInt(idNota, 10);

      if (isNaN(idUsuarioNum) || isNaN(idNotaNum)) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      const nota = await notaService.obtenerNotaPorId(idNotaNum, idUsuarioNum);

      if (!nota) {
        return res.status(404).json({
          success: false,
          message: "Nota no encontrada",
        });
      }

      res.json({
        success: true,
        nota,
      });
    } catch (error) {
      console.error("Error al obtener nota:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener nota",
        error: error.message,
      });
    }
  },

  // POST /api/notas
  crearNota: async (req, res) => {
    try {
      const { id_usuario, titulo, contenido, id_transaccion } = req.body;

      if (!id_usuario || !titulo) {
        return res.status(400).json({
          success: false,
          message: "id_usuario y titulo son requeridos",
        });
      }

      if (titulo.length > 50) {
        return res.status(400).json({
          success: false,
          message: "El título no puede superar 50 caracteres",
        });
      }

      if (contenido != null && contenido.length > 200) {
        return res.status(400).json({
          success: false,
          message: "El contenido no puede superar 200 caracteres",
        });
      }

      const idUsuarioNum = parseInt(id_usuario, 10);
      const idTransaccionNum =
        id_transaccion != null ? parseInt(id_transaccion, 10) : null;

      if (isNaN(idUsuarioNum)) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario inválido",
        });
      }

      if (
        id_transaccion != null &&
        (isNaN(idTransaccionNum) || idTransaccionNum <= 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "id_transaccion debe ser un número positivo o no enviarse",
        });
      }

      const nuevaNota = await notaService.crearNota({
        id_usuario: idUsuarioNum,
        titulo: titulo.trim(),
        contenido: contenido != null ? contenido.trim() || null : null,
        id_transaccion: idTransaccionNum,
      });

      res.status(201).json({
        success: true,
        nota: nuevaNota,
        message: "Nota creada exitosamente",
      });
    } catch (error) {
      console.error("Error al crear nota:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear nota",
        error: error.message,
      });
    }
  },

  // PUT /api/notas/:idNota
  actualizarNota: async (req, res) => {
    try {
      const { idNota } = req.params;
      const { id_usuario, titulo, contenido, id_transaccion } = req.body;

      if (!id_usuario || !titulo) {
        return res.status(400).json({
          success: false,
          message: "id_usuario y titulo son requeridos",
        });
      }

      if (titulo.length > 50) {
        return res.status(400).json({
          success: false,
          message: "El título no puede superar 50 caracteres",
        });
      }

      if (contenido != null && contenido.length > 200) {
        return res.status(400).json({
          success: false,
          message: "El contenido no puede superar 200 caracteres",
        });
      }

      const idNotaNum = parseInt(idNota, 10);
      const idUsuarioNum = parseInt(id_usuario, 10);
      const idTransaccionNum =
        id_transaccion != null ? parseInt(id_transaccion, 10) : null;

      if (isNaN(idNotaNum) || isNaN(idUsuarioNum)) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      if (
        id_transaccion != null &&
        (isNaN(idTransaccionNum) || idTransaccionNum <= 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "id_transaccion debe ser un número positivo o null",
        });
      }

      const notaActualizada = await notaService.actualizarNota(
        idNotaNum,
        idUsuarioNum,
        {
          titulo: titulo.trim(),
          contenido: contenido != null ? contenido.trim() || null : null,
          id_transaccion: idTransaccionNum,
        }
      );

      if (!notaActualizada) {
        return res.status(404).json({
          success: false,
          message: "Nota no encontrada",
        });
      }

      res.json({
        success: true,
        nota: notaActualizada,
        message: "Nota actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar nota:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar nota",
        error: error.message,
      });
    }
  },

  // DELETE /api/notas/:idNota
  eliminarNota: async (req, res) => {
    try {
      const { idNota } = req.params;
      const { id_usuario } = req.body;

      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: "id_usuario es requerido",
        });
      }

      const idNotaNum = parseInt(idNota, 10);
      const idUsuarioNum = parseInt(id_usuario, 10);

      if (isNaN(idNotaNum) || isNaN(idUsuarioNum)) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      const notaEliminada = await notaService.eliminarNota(
        idNotaNum,
        idUsuarioNum
      );

      if (!notaEliminada) {
        return res.status(404).json({
          success: false,
          message: "Nota no encontrada",
        });
      }

      res.json({
        success: true,
        message: "Nota eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar nota:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar nota",
        error: error.message,
      });
    }
  },
};

module.exports = notaController;
