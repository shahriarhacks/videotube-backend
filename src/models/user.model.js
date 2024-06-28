import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { CONFIG } from "../config/index.js";

const userSchema = new Schema(
   {
      username: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         lowercase: true,
         index: true,
         max: 23,
      },
      email: {
         type: String,
         unique: true,
         lowercase: true,
         trim: true,
         required: true,
      },
      fullName: {
         type: String,
         required: true,
         trim: true,
         index: true,
      },
      avatar: {
         type: String, //Cloudinary url
         required: true,
      },
      coverImage: {
         type: String, //Cloudinary url
      },
      password: {
         type: String,
         required: true,
      },
      refreshToken: {
         type: String,
      },
      watchHistory: [
         {
            type: Schema.Types.ObjectId,
            ref: "Video",
         },
      ],
   },
   {
      timestamps: true,
   }
);

userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) {
      return next();
   }
   this.password = await bcrypt.hash(this.password, 10);
   next();
});

userSchema.methods.isPasswordMatched = async function (password) {
   return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToke = function () {
   return jwt.sign(
      {
         _id: this._id,
         email: this.email,
         username: this.username,
         fullName: this.fullName,
      },
      CONFIG.JWT.ACCESS_SECRET,
      { expiresIn: CONFIG.JWT.ACCESS_EXPIRE }
   );
};

userSchema.methods.generateRefreshToken = function () {
   return jwt.sign({ _id: this._id }, CONFIG.JWT.REFRESH_SECRET, {
      expiresIn: CONFIG.JWT.REFRESH_EXPIRE,
   });
};

const User = mongoose.model("User", userSchema);

export default User;
