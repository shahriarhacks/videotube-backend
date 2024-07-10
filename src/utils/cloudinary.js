import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CONFIG } from "../config/index.js";
import { APIError } from "./ApiError.js";

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
      // console.log(`File is uploaded on Cloudinary : ${response.url}`);
      fs.unlinkSync(localFilePath);
      return response;
   } catch (error) {
      fs.unlinkSync(localFilePath);

      return null;
   }
};

const deleteFromCloudinary = async (cloudinaryUrl) => {
   try {
      // Extract the public ID from the image URL
      const publicId = cloudinaryUrl.match(/\/([^/]+)\.[^/.]+$/)[1];

      // Delete the image using the public ID
      const response = await cloudinary.uploader.destroy(publicId);

      if (!response.result === "ok") {
         throw new APIError(500, "Error while deleting!!");
      }
      return response;
   } catch (error) {
      throw new APIError(500, error?.message || "Error while deleting!!");
   }
};

export { uploadOnCloudinary, deleteFromCloudinary };
