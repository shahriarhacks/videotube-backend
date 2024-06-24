import app from "./app.js";
import { CONFIG } from "./config/index.js";
import { connectDB } from "./db/index.js";

connectDB()
   .then(() => {
      app.listen(CONFIG.PORT, () => {
         console.log(`Application listening on port ${CONFIG.PORT}`);
      });
      app.on("error", (error) => {
         console.log(`Server Listening ERROR: `, error);
      });
   })
   .catch((err) => console.log("MONGODB connection failed!!!", err));
