import Video from "../models/video.model.js";
import { APIError } from "../utils/ApiError.js";
import { APIResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishAVideo = asyncHandler(async (req, res) => {
   const { title, description } = req.body;
   const videoFileLocalPath = req.files?.videoFile[0]?.path;
   const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
   if (
      [title, description, videoFileLocalPath, thumbnailLocalPath].some(
         (field) => field?.trim() === ""
      )
   ) {
      throw new APIError(400, "All fields are required");
   }

   const videoFile = await uploadOnCloudinary(videoFileLocalPath);
   console.log(videoFile);
   const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
   if (!videoFile) {
      throw new APIError(500, "Error while uploading the video!!");
   }
   if (!thumbnail) {
      throw new APIError(500, "Error while uploading the thumbnail!!");
   }
   const video = await Video.create({
      title,
      description,
      videoFile: videoFile?.url,
      thumbnail: thumbnail?.url,
      duration: videoFile?.duration,
      owner: req.user?._id,
   });

   return res
      .status(201)
      .json(new APIResponse(200, video, "Video published done!!"));
});

export { publishAVideo };
