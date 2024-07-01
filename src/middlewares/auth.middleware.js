import jwt from "jsonwebtoken";
import { APIError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { CONFIG } from "../config/index.js";
import User from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _res, next) => {
   try {
      const token =
         req.cookies?.accessToken ||
         req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
         throw new APIError(401, "Unauthorized Request, Token needed!!");
      }
      const decoded = jwt.verify(token, CONFIG.JWT.ACCESS_SECRET);

      const user = await User.findById(decoded?._id).select(
         "-password -refreshToken"
      );
      if (!user) {
         throw new APIError(401, "Invalid access token!!");
      }
      req.user = user;

      next();
   } catch (error) {
      throw new APIError(401, error?.message || "Invalid Access Token");
   }
});
