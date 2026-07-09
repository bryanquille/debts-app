// index.ts — Punto de entrada del servidor Express
//
// Orden de la configuración:
// 1. Helmet (seguridad: cabeceras HTTP)
// 2. CORS (permitir requests desde el frontend)
// 3. Cookie parser (leer cookies, necesarias para refresh token)
// 4. JSON parser (para recibir JSON en el body)
// 5. Rutas
// 6. Error handler (debe ir al final)

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;

// 1. Helmet — agrega cabeceras de seguridad HTTP
//    X-Frame-Options: previene clickjacking
//    X-Content-Type-Options: previene MIME sniffing
//    Strict-Transport-Security: fuerza HTTPS
//    X-XSS-Protection: mitigación XSS
app.use(helmet());

// 2. CORS — permite que el frontend (http://localhost:5173) haga requests al backend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Necesario para cookies (refresh token)
  })
);

// 3. Cookie parser — convierte las cookies del request en un objeto accesible
app.use(cookieParser());

// 4. JSON parser — convierte el body de los requests con Content-Type: application/json
app.use(express.json());

// 5. Rutas — todas las rutas de la API
app.use("/api", routes);

// 6. Error handler — captura errores lanzados en los controladores
app.use(errorHandler);

// Express 5: app.listen() devuelve una Promise
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;