const pool = require("../config/db");

const transaccionServices = {
  // Obtener todas las transacciones de un usuario
  obtenerTransaccionesPorUsuario: async (idUsuario) => {
    const result = await pool.query(
      `
      SELECT 
        t.*,
        c.nombre_categoria,
        c.tipo
      FROM transaccion t
      JOIN categoria c ON c.id_categoria = t.id_categoria
      WHERE t.id_usuario = $1
      ORDER BY t.fecha_registro DESC, t.id_transaccion DESC
      `,
      [idUsuario]
    );
    return result.rows;
  },

  // Crear una nueva transacción
  crearTransaccion: async (transaccionData) => {
    const { id_usuario, id_categoria, monto, descripcion } = transaccionData;

    const result = await pool.query(
      `
      WITH inserted AS (
        INSERT INTO transaccion (id_usuario, id_categoria, monto, descripcion)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      )
      SELECT 
        inserted.*,
        c.nombre_categoria,
        c.tipo
      FROM inserted
      JOIN categoria c ON c.id_categoria = inserted.id_categoria
      `,
      [id_usuario, id_categoria, monto, descripcion || null]
    );

    return result.rows[0];
  },

  // Eliminar una transacción
  eliminarTransaccion: async (idTransaccion, idUsuario) => {
    const result = await pool.query(
      "DELETE FROM transaccion WHERE id_transaccion = $1 AND id_usuario = $2 RETURNING *",
      [idTransaccion, idUsuario]
    );
    return result.rows[0];
  },
};

module.exports = transaccionServices;

