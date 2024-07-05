import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { APIResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config/index.js";

const options = {
   httpOnly: true,
   secure: true,
};

const generateAccessAndRefreshTokens = async (uid) => {
   try {
      const user = await User.findById(uid);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
   } catch (error) {
      throw new APIError(500, "Something went wrong while generating tokens!");
   }
};

const registerUser = asyncHandler(async (req, res) => {
   /**
    * Get user details from frontend
    * validation data -> not empty
    * check if user already exist or not : username or email
    * Check for images, check for avatar and coverImage
    * upload them to cloudinary, avatar
    * create a user object-> create a new entry to db
    * Remove password and refresh token from response
    * Check for user creation
    * return response
    **/

   const { fullName, username, password, email } = req.body;
   // Validation Data -> not empty
   if (
      [fullName, email, password, username].some(
         (field) => field?.trim() === ""
      )
   ) {
      throw new APIError(400, "All fields are required");
   }

   // Checking user already exist or not->
   const isExist = await User.findOne({
      $or: [{ username }, { email }],
   });

   if (isExist) {
      throw new APIError(409, "User with email or username already exist");
   }
   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if (!avatarLocalPath) {
      throw new APIError(400, "Avatar file LocalPath is required");
   }
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if (!avatar) {
      throw new APIError(500, "Problem on uploading avatar");
   }
   const user = await User.create({
      username: username.toLowerCase(),
      password,
      fullName,
      email,
      avatar: avatar.url,
      coverImage: coverImage.url || "",
   });

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );

   if (!createdUser) {
      throw new APIError(500, "Something went wrong while creating new user");
   }
   return res
      .status(201)
      .json(new APIResponse(201, createdUser, "User created successfully!!"));
});

const loginUser = asyncHandler(async (req, res) => {
   /**
    * req.body-> Data
    * username or email
    * find the user
    * check the password
    * generate the tokens -> access & refresh token
    * send the tokens on cookies
    * give a response->200
    **/
   const { username, email, password } = req.body;
   if (!(username || email)) {
      throw new APIError(400, "username or email must be required");
   }
   const user = await User.findOne({
      $or: [{ username }, { email }],
   });
   if (!user) {
      throw new APIError(404, "User doesn't exist!");
   }

   const isPasswordValid = await user.isPasswordMatched(password);

   if (!isPasswordValid) {
      throw new APIError(401, "Invalid user credentials!");
   }

   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
   );
   const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );

   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new APIResponse(
            200,
            { user: loggedInUser, refreshToken, accessToken },
            "User logged in successfully!!"
         )
      );
});

const logoutUser = asyncHandler(async (req, res) => {
   await User.findOneAndUpdate(
      req.user?._id,
      {
         $set: {
            refreshToken: undefined,
         },
      },
      {
         new: true,
      }
   );
   return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new APIResponse(200, {}, "User logged out successfully!!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body;
   if (!incomingRefreshToken) {
      throw new APIError(401, "Invalid refresh token!!");
   }
   try {
      const decoded = jwt.verify(
         incomingRefreshToken,
         CONFIG.JWT.REFRESH_SECRET
      );

      const user = await User.findById(decoded?._id);

      if (!user) {
         throw new APIError(401, "Invalid refresh token!!");
      }
      if (incomingRefreshToken !== user.refreshToken) {
         throw new APIError(401, "Refresh token is expired or used!!");
      }
      const { accessToken, refreshToken } =
         await generateAccessAndRefreshTokens(user._id);

      return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", refreshToken, options)
         .json(
            new APIResponse(
               200,
               { accessToken, refreshToken, user },
               "Access token refreshed successfully!!"
            )
         );
   } catch (error) {
      throw new APIError(401, error?.message || "Invalid refresh token!!");
   }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
   const { oldPassword, newPassword, confirmPassword } = req.body;

   if (!(newPassword === confirmPassword)) {
      throw new APIError(
         400,
         "New Password and Confirm Password not matched!!"
      );
   }

   const user = await User.findById(req.user?._id);

   const isPasswordMatched = await user.isPasswordMatched(oldPassword);
   if (!isPasswordMatched) {
      throw new APIError(400, "Invalid old password!!");
   }

   user.password = newPassword;
   await user.save({ validateBeforeSave: false });
   return res
      .status(200)
      .json(new APIResponse(200, {}, "Password changed successfully!!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
   return res
      .status(200)
      .json(
         new APIResponse(200, req.user, "Current user retrieve successfully!!")
      );
});

// const updateAccountDetails = asyncHandler(async (req, res) => {
//    let user = {};
//    const { fullName, email, username } = req.body;
//    if (fullName && !email && !username) {
//       user = await User.findByIdAndUpdate(
//          req.user?._id,
//          {
//             $set: { fullName },
//          },
//          { new: true }
//       );
//    } else if (email && !fullName && !username) {
//       user = await User.findByIdAndUpdate(
//          req.user?._id,
//          {
//             $set: { email },
//          },
//          { new: true }
//       );
//    } else if (username && !fullName && !email) {
//       user = await User.findByIdAndUpdate(
//          req.user?._id,
//          {
//             $set: { username },
//          },
//          { new: true }
//       );
//    } else if (email && fullName && !username) {
//       user = await User.findByIdAndUpdate(
//          req.user?._id,
//          {
//             $set: { email, fullName },
//          },
//          { new: true }
//       );
//    } else if (email && username && !fullName) {
//       user = await User.findByIdAndUpdate(
//          req.user?._id,
//          {
//             $set: { email, username },
//          },
//          { new: true }
//       );
//    } else if (fullName && username && !email) {
//       user = await User.findByIdAndUpdate(
//          req.user?._id,
//          {
//             $set: { fullName, username },
//          },
//          { new: true }
//       );
//    } else {
//       user = await User.findByIdAndUpdate(
//          req.user?._id,
//          {
//             $set: { email, username, fullName },
//          },
//          { new: true }
//       );
//    }
//    return res
//       .status(200)
//       .json(new APIResponse(200, user, "User Account Details Updated Done!"));
// });

const updateAccountDetails = asyncHandler(async (req, res) => {
   const { fullName, email, username } = req.body;
   const updateFields = {};

   if (fullName) updateFields.fullName = fullName;
   if (email) updateFields.email = email;
   if (username) updateFields.username = username;

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: updateFields,
      },
      { new: true }
   );

   return res
      .status(200)
      .json(new APIResponse(200, user, "User Account Details Updated Done!"));
});

export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
};
