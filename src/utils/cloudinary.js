import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CONFIG } from "../config/index.js";

// Configuration
cloudinary.config({
   cloud_name: CONFIG.CLOUDINARY.CLOUD_NAME,
   api_key: CONFIG.CLOUDINARY.API_KEY,
   api_secret: CONFIG.CLOUDINARY.API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
   try {
      if (!localFilePath) {
         return null;
      }
      const response = await cloudinary.uploader.upload(localFilePath, {
         resource_type: "auto",
      });
      console.log(`File is uploaded on Cloudinary : ${response.url}`);
      return response;
   } catch (error) {
      fs.unlinkSync(localFilePath);

      return null;
   }
};

export { uploadOnCloudinary };
