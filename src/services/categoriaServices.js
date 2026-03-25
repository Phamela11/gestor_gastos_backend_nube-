const pool = require("../config/db");

const categoriaServices = {
  // Obtener todas las categorías de un usuario
  obtenerCategoriasPorUsuario: async (idUsuario) => {
    const result = await pool.query(
      "SELECT * FROM categoria WHERE id_usuario = $1 ORDER BY nombre_categoria",
      [idUsuario]
    );
    return result.rows;
  },

  // Obtener una categoría por ID
  obtenerCategoriaPorId: async (idCategoria, idUsuario) => {
    const result = await pool.query(
      "SELECT * FROM categoria WHERE id_categoria = $1 AND id_usuario = $2",
      [idCategoria, idUsuario]
    );
    return result.rows[0];
  },

  // Crear una nueva categoría
  crearCategoria: async (categoriaData) => {
    const { id_usuario, nombre_categoria, tipo, descripcion } = categoriaData;
    const result = await pool.query(
      "INSERT INTO categoria (id_usuario, nombre_categoria, tipo, descripcion) VALUES ($1, $2, $3, $4) RETURNING *",
      [id_usuario, nombre_categoria, tipo, descripcion || null]
    );
    return result.rows[0];
  },

  // Actualizar una categoría
  actualizarCategoria: async (idCategoria, idUsuario, categoriaData) => {
    const { nombre_categoria, tipo, descripcion } = categoriaData;
    const result = await pool.query(
      "UPDATE categoria SET nombre_categoria = $1, tipo = $2, descripcion = $3 WHERE id_categoria = $4 AND id_usuario = $5 RETURNING *",
      [nombre_categoria, tipo, descripcion || null, idCategoria, idUsuario]
    );
    return result.rows[0];
  },

  // Eliminar una categoría
  eliminarCategoria: async (idCategoria, idUsuario) => {
    const result = await pool.query(
      "DELETE FROM categoria WHERE id_categoria = $1 AND id_usuario = $2 RETURNING *",
      [idCategoria, idUsuario]
    );
    return result.rows[0];
  },
};

module.exports = categoriaServices;



