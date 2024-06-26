import asyncHandler from "../utils/asyncHandler.js";

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
    */
});

export { registerUser };
