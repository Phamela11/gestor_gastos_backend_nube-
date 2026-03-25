const pool = require("../config/db");

const presupuestoService = {
  /**
   * Obtener todos los presupuestos de un usuario (con nombres de categoría y gastado en el rango)
   */
  obtenerPresupuestosPorUsuario: async (idUsuario) => {
    const result = await pool.query(
      `SELECT p.*, c.nombre_categoria, c.tipo AS tipo_categoria,
        (SELECT COALESCE(SUM(ABS(t.monto)), 0)::numeric
         FROM transaccion t
         JOIN categoria c2 ON c2.id_categoria = t.id_categoria AND c2.tipo = 'gasto'
         WHERE t.id_usuario = p.id_usuario
           AND t.id_categoria = p.id_categoria
           AND t.fecha_registro::date >= p.fecha_inicio
           AND t.fecha_registro::date <= p.fecha_fin
        ) AS gastado
       FROM presupuesto p
       JOIN categoria c ON c.id_categoria = p.id_categoria
       WHERE p.id_usuario = $1
       ORDER BY p.fecha_inicio DESC, p.id_presupuesto DESC`,
      [idUsuario]
    );
    return result.rows.map((row) => ({
      ...row,
      gastado: parseFloat(row.gastado ?? "0", 10),
    }));
  },

  /**
   * Obtener un presupuesto por ID (y usuario para seguridad)
   */
  obtenerPresupuestoPorId: async (idPresupuesto, idUsuario) => {
    const result = await pool.query(
      `SELECT p.*, c.nombre_categoria, c.tipo AS tipo_categoria
       FROM presupuesto p
       JOIN categoria c ON c.id_categoria = p.id_categoria
       WHERE p.id_presupuesto = $1 AND p.id_usuario = $2`,
      [idPresupuesto, idUsuario]
    );
    return result.rows[0];
  },

  /**
   * Comprobar si ya existe un presupuesto para (usuario, categoría).
   * Si se pasa excluirIdPresupuesto, se ignora ese presupuesto (para edición).
   */
  existePresupuestoParaCategoria: async (
    idUsuario,
    idCategoria,
    excluirIdPresupuesto = null
  ) => {
    let query = `SELECT 1 FROM presupuesto
                 WHERE id_usuario = $1 AND id_categoria = $2`;
    const params = [idUsuario, idCategoria];
    if (excluirIdPresupuesto != null) {
      params.push(excluirIdPresupuesto);
      query += ` AND id_presupuesto != $3`;
    }
    query += ` LIMIT 1`;
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  },

  /**
   * Crear un nuevo presupuesto (no permite duplicar categoría por usuario)
   */
  crearPresupuesto: async (data) => {
    const {
      id_usuario,
      id_categoria,
      monto_limite,
      fecha_inicio,
      fecha_fin,
    } = data;

    const yaExiste = await presupuestoService.existePresupuestoParaCategoria(
      id_usuario,
      id_categoria
    );
    if (yaExiste) {
      const err = new Error(
        "Ya existe un presupuesto para esta categoría. Edita o elimina el existente."
      );
      err.code = "PRESUPUESTO_DUPLICADO_CATEGORIA";
      throw err;
    }

    const result = await pool.query(
      `INSERT INTO presupuesto (id_usuario, id_categoria, monto_limite, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id_usuario, id_categoria, monto_limite, fecha_inicio, fecha_fin]
    );
    return result.rows[0];
  },

  /**
   * Actualizar un presupuesto (no permite cambiar a una categoría que ya tiene presupuesto)
   */
  actualizarPresupuesto: async (idPresupuesto, idUsuario, data) => {
    const {
      id_categoria,
      monto_limite,
      fecha_inicio,
      fecha_fin,
    } = data;

    const yaExiste = await presupuestoService.existePresupuestoParaCategoria(
      idUsuario,
      id_categoria,
      idPresupuesto
    );
    if (yaExiste) {
      const err = new Error(
        "Ya existe otro presupuesto para esta categoría. Elige otra categoría o elimina el existente."
      );
      err.code = "PRESUPUESTO_DUPLICADO_CATEGORIA";
      throw err;
    }

    const result = await pool.query(
      `UPDATE presupuesto
       SET id_categoria = $1, monto_limite = $2, fecha_inicio = $3, fecha_fin = $4
       WHERE id_presupuesto = $5 AND id_usuario = $6
       RETURNING *`,
      [
        id_categoria,
        monto_limite,
        fecha_inicio,
        fecha_fin,
        idPresupuesto,
        idUsuario,
      ]
    );
    return result.rows[0];
  },

  /**
   * Eliminar un presupuesto
   */
  eliminarPresupuesto: async (idPresupuesto, idUsuario) => {
    const result = await pool.query(
      `DELETE FROM presupuesto
       WHERE id_presupuesto = $1 AND id_usuario = $2
       RETURNING *`,
      [idPresupuesto, idUsuario]
    );
    return result.rows[0];
  },

  /**
   * Buscar presupuesto vigente para una categoría y usuario en una fecha dada.
   * Devuelve el presupuesto si existe y la fecha está en [fecha_inicio, fecha_fin].
   */
  buscarPresupuestoVigente: async (idUsuario, idCategoria, fecha) => {
    const result = await pool.query(
      `SELECT *
       FROM presupuesto
       WHERE id_usuario = $1
         AND id_categoria = $2
         AND $3::date >= fecha_inicio
         AND $3::date <= fecha_fin
       LIMIT 1`,
      [idUsuario, idCategoria, fecha]
    );
    return result.rows[0];
  },

  /**
   * Suma de gastos (ABS(monto)) de un usuario en una categoría tipo 'gasto'
   * dentro del rango [fechaInicio, fechaFin].
   */
  sumarGastosCategoriaEnRango: async (
    idUsuario,
    idCategoria,
    fechaInicio,
    fechaFin
  ) => {
    const result = await pool.query(
      `SELECT COALESCE(SUM(ABS(t.monto)), 0) AS total
       FROM transaccion t
       JOIN categoria c ON c.id_categoria = t.id_categoria
       WHERE t.id_usuario = $1
         AND t.id_categoria = $2
         AND c.tipo = 'gasto'
         AND t.fecha_registro::date >= $3
         AND t.fecha_registro::date <= $4`,
      [idUsuario, idCategoria, fechaInicio, fechaFin]
    );
    const total = parseFloat(result.rows[0]?.total ?? "0", 10);
    return total;
  },

  /**
   * Verificación al crear una transacción: si existe presupuesto para esa
   * categoría y usuario en la fecha de la transacción, se suma el gasto
   * en ese rango y se compara con monto_limite.
   * Devuelve { presupuesto_superado: true } si se supera; si no hay presupuesto
   * o no se supera, devuelve { presupuesto_superado: false }.
   */
  verificarPresupuestoAlCrearTransaccion: async (
    idUsuario,
    idCategoria,
    fechaRegistro
  ) => {
    const presupuesto = await presupuestoService.buscarPresupuestoVigente(
      idUsuario,
      idCategoria,
      fechaRegistro
    );

    console.log("🔍 Presupuesto encontrado:", presupuesto);

    if (!presupuesto) {
      console.log("❌ No hay presupuesto vigente");
      return { presupuesto_superado: false };
    }

    const totalGastado = await presupuestoService.sumarGastosCategoriaEnRango(
      idUsuario,
      idCategoria,
      presupuesto.fecha_inicio,
      presupuesto.fecha_fin
    );

    console.log("💰 Total gastado:", totalGastado);
    console.log("📊 Monto límite:", presupuesto.monto_limite);

    const limite = parseFloat(presupuesto.monto_limite, 10);
    const superado = totalGastado > limite;

    console.log("⚠️ Presupuesto superado:", superado);

    return { presupuesto_superado: superado };
  },
};

module.exports = presupuestoService;
