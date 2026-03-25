const pool = require("../config/db");

const mensaje = (req, res) => {
  res.json({ mensaje: "Backend estructurado funcionando 🚀 (v2)" });
};

const register = async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({
      success: false,
      message: "Nombre, correo y contraseña son requeridos",
    });
  }

  try {
    // Verificar que no exista un usuario con el mismo correo
    const existing = await pool.query(
      "SELECT id_usuario FROM usuario WHERE correo = $1",
      [correo.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Ya existe un usuario con ese correo",
      });
    }

    const result = await pool.query(
      "INSERT INTO usuario (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING *",
      [nombre.trim(), correo.trim(), contrasena.trim()]
    );

    res.status(201).json({
      success: true,
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  // Logs para debug
  console.log("Datos recibidos:", { correo, contrasena });
  console.log("Tipo de correo:", typeof correo, "Longitud:", correo?.length);
  console.log("Tipo de contrasena:", typeof contrasena, "Longitud:", contrasena?.length);

  if (!correo || !contrasena) {
    return res.status(400).json({
      success: false,
      message: "Correo y contraseña son requeridos",
    });
  }

  try {
    // Primero buscar por correo para ver si existe
    const resultCorreo = await pool.query(
      "SELECT * FROM usuario WHERE correo = $1",
      [correo.trim()]
    );

    console.log("Usuarios encontrados por correo:", resultCorreo.rows.length);
    
    if (resultCorreo.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    // Mostrar la contraseña almacenada (solo para debug)
    const usuarioEncontrado = resultCorreo.rows[0];
    console.log("Contraseña almacenada en DB:", usuarioEncontrado.contrasena);
    console.log("Contraseña recibida:", contrasena.trim());
    console.log("¿Coinciden?:", usuarioEncontrado.contrasena === contrasena.trim());

    // Ahora verificar la contraseña
    const result = await pool.query(
      "SELECT * FROM usuario WHERE correo = $1 AND contrasena = $2",
      [correo.trim(), contrasena.trim()]
    );

    console.log("Usuarios encontrados con contraseña:", result.rows.length);
    if (result.rows.length > 0) {
      console.log("Usuario encontrado:", result.rows[0].nombre);
    }

    if (result.rows.length > 0) {
      res.json({
        success: true,
        usuario: result.rows[0],
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

module.exports = { mensaje, login, register };
