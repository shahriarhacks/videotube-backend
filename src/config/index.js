import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const CONFIG = {
   ENV: process.env.NODE_ENV,
   PORT: process.env.PORT,
   DB_URI: process.env.MONGODB_URI,
   CORS_ORIGIN: process.env.CORS_ORIGIN,
   JWT: {
      ACCESS_SECRET: process.env.ACCESS_TOKEN_SECRET,
      REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET,
      ACCESS_EXPIRE: process.env.ACCESS_TOKEN_EXPIRE,
      REFRESH_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE,
   },
};

export { CONFIG };
