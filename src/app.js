import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { CONFIG } from "./config/index.js";
import router from "./routes/default.route.js";

const app = express();

// Middleware calling
app.use(
   cors({
      origin: CONFIG.CORS_ORIGIN,
      credentials: true,
   })
);
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Calling All API routes
app.use('/api/v1',router)

export default app;
