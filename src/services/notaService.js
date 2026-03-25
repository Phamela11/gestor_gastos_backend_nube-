const pool = require("../config/db");

const notaService = {
  // Obtener todas las notas de un usuario
  obtenerNotasPorUsuario: async (idUsuario) => {
    const result = await pool.query(
      "SELECT * FROM nota WHERE id_usuario = $1 ORDER BY fecha_registro DESC, id_nota DESC",
      [idUsuario]
    );
    return result.rows;
  },

  // Obtener una nota por ID
  obtenerNotaPorId: async (idNota, idUsuario) => {
    const result = await pool.query(
      "SELECT * FROM nota WHERE id_nota = $1 AND id_usuario = $2",
      [idNota, idUsuario]
    );
    return result.rows[0];
  },

  // Crear una nueva nota (id_transaccion opcional)
  crearNota: async (notaData) => {
    const { id_usuario, titulo, contenido, id_transaccion } = notaData;
    const result = await pool.query(
      "INSERT INTO nota (id_usuario, titulo, contenido, id_transaccion) VALUES ($1, $2, $3, $4) RETURNING *",
      [id_usuario, titulo, contenido || null, id_transaccion ?? null]
    );
    return result.rows[0];
  },

  // Actualizar una nota
  actualizarNota: async (idNota, idUsuario, notaData) => {
    const { titulo, contenido, id_transaccion } = notaData;
    const result = await pool.query(
      "UPDATE nota SET titulo = $1, contenido = $2, id_transaccion = $3 WHERE id_nota = $4 AND id_usuario = $5 RETURNING *",
      [titulo, contenido || null, id_transaccion ?? null, idNota, idUsuario]
    );
    return result.rows[0];
  },

  // Eliminar una nota
  eliminarNota: async (idNota, idUsuario) => {
    const result = await pool.query(
      "DELETE FROM nota WHERE id_nota = $1 AND id_usuario = $2 RETURNING *",
      [idNota, idUsuario]
    );
    return result.rows[0];
  },
};

module.exports = notaService;
