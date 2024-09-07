import mongoose from "mongoose";
import { Role, UserSchema } from "../types/user";

const userSchema = new mongoose.Schema<UserSchema>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Role,
      default: Role.USER,
    },
  },
  { timestamps: true }
);

const User = mongoose.model<UserSchema>("User", userSchema);

export default User;
