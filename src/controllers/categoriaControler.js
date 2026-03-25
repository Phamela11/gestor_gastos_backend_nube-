const categoriaServices = require("../services/categoriaServices");

const categoriaController = {
  // GET /api/categorias/:idUsuario
  obtenerCategorias: async (req, res) => {
    try {
      const { idUsuario } = req.params;

      if (!idUsuario) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario es requerido",
        });
      }

      // Convertir a número
      const idUsuarioNum = parseInt(idUsuario, 10);
      
      if (isNaN(idUsuarioNum)) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario inválido",
        });
      }

      const categorias = await categoriaServices.obtenerCategoriasPorUsuario(idUsuarioNum);

      res.json({
        success: true,
        categorias,
      });
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener categorías",
        error: error.message,
      });
    }
  },

  // GET /api/categorias/:idUsuario/:idCategoria
  obtenerCategoria: async (req, res) => {
    try {
      const { idUsuario, idCategoria } = req.params;

      // Convertir a números
      const idUsuarioNum = parseInt(idUsuario, 10);
      const idCategoriaNum = parseInt(idCategoria, 10);

      if (isNaN(idUsuarioNum) || isNaN(idCategoriaNum)) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      const categoria = await categoriaServices.obtenerCategoriaPorId(
        idCategoriaNum,
        idUsuarioNum
      );

      if (!categoria) {
        return res.status(404).json({
          success: false,
          message: "Categoría no encontrada",
        });
      }

      res.json({
        success: true,
        categoria,
      });
    } catch (error) {
      console.error("Error al obtener categoría:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener categoría",
        error: error.message,
      });
    }
  },

  // POST /api/categorias
  crearCategoria: async (req, res) => {
    try {
      const { id_usuario, nombre_categoria, tipo, descripcion } = req.body;

      if (!id_usuario || !nombre_categoria || !tipo) {
        return res.status(400).json({
          success: false,
          message: "id_usuario, nombre_categoria y tipo son requeridos",
        });
      }

      if (tipo !== "gasto" && tipo !== "ingreso") {
        return res.status(400).json({
          success: false,
          message: "El tipo debe ser 'gasto' o 'ingreso'",
        });
      }

      const nuevaCategoria = await categoriaServices.crearCategoria({
        id_usuario,
        nombre_categoria,
        tipo,
        descripcion,
      });

      res.status(201).json({
        success: true,
        categoria: nuevaCategoria,
        message: "Categoría creada exitosamente",
      });
    } catch (error) {
      console.error("Error al crear categoría:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear categoría",
        error: error.message,
      });
    }
  },

  // PUT /api/categorias/:idCategoria
  actualizarCategoria: async (req, res) => {
    try {
      const { idCategoria } = req.params;
      const { id_usuario, nombre_categoria, tipo, descripcion } = req.body;

      if (!id_usuario || !nombre_categoria || !tipo) {
        return res.status(400).json({
          success: false,
          message: "id_usuario, nombre_categoria y tipo son requeridos",
        });
      }

      if (tipo !== "gasto" && tipo !== "ingreso") {
        return res.status(400).json({
          success: false,
          message: "El tipo debe ser 'gasto' o 'ingreso'",
        });
      }

      // Convertir a números
      const idCategoriaNum = parseInt(idCategoria, 10);
      const idUsuarioNum = parseInt(id_usuario, 10);

      if (isNaN(idCategoriaNum) || isNaN(idUsuarioNum)) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      const categoriaActualizada = await categoriaServices.actualizarCategoria(
        idCategoriaNum,
        idUsuarioNum,
        { nombre_categoria, tipo, descripcion }
      );

      if (!categoriaActualizada) {
        return res.status(404).json({
          success: false,
          message: "Categoría no encontrada",
        });
      }

      res.json({
        success: true,
        categoria: categoriaActualizada,
        message: "Categoría actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar categoría",
        error: error.message,
      });
    }
  },

  // DELETE /api/categorias/:idCategoria
  eliminarCategoria: async (req, res) => {
    try {
      const { idCategoria } = req.params;
      const { id_usuario } = req.body;

      if (!id_usuario) {
        return res.status(400).json({
          success: false,
          message: "id_usuario es requerido",
        });
      }

      // Convertir a números
      const idCategoriaNum = parseInt(idCategoria, 10);
      const idUsuarioNum = parseInt(id_usuario, 10);

      if (isNaN(idCategoriaNum) || isNaN(idUsuarioNum)) {
        return res.status(400).json({
          success: false,
          message: "IDs inválidos",
        });
      }

      const categoriaEliminada = await categoriaServices.eliminarCategoria(
        idCategoriaNum,
        idUsuarioNum
      );

      if (!categoriaEliminada) {
        return res.status(404).json({
          success: false,
          message: "Categoría no encontrada",
        });
      }

      res.json({
        success: true,
        message: "Categoría eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar categoría",
        error: error.message,
      });
    }
  },
};

module.exports = categoriaController;

