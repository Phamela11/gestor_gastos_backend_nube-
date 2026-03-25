const express = require("express");
const cors = require("cors");

const routes = require("./routes/index.js");
const presupuestoRoutes = require("./routes/presupuestoRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());

// Montar presupuestos directamente para asegurar que la ruta exista
app.use("/api/presupuestos", presupuestoRoutes);

app.use("/", routes);

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error("Error en el servidor:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

module.exports = app;
