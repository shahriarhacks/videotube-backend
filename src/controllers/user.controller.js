import asyncHandler from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
   res.status(201).json({
      message: "OK",
   });
});

export { registerUser };
