import mongoose, { Schema } from "mongoose";

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
         type: String, //Cloudninary url
         required: true,
      },
      coverImage: {
         type: String,
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

const User = mongoose.model("User", userSchema);

export default User;
