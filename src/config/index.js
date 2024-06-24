import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const CONFIG = {
   ENV: process.env.NODE_ENV,
   PORT: process.env.PORT,
   DB_URI: process.env.MONGODB_URI,
   CORS_ORIGIN: process.env.CORS_ORIGIN,
};

export { CONFIG };
