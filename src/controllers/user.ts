import { NextFunction, Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import config from "../config/config";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // console.log(req.body);
    const { username, email, password, bio, fname, lname } = req.body;
    const existingUser = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingUser || existingUsername) {
      return next(createHttpError(404, "user already exist"));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      bio,
      fname,
      lname,
    });
    return res.status(201).send(user);
  } catch (error) {
    console.log(error);
    return next(
      createHttpError(500, "Something went wrong in createUser API!")
    );
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(404, "Invalid Email or Password"));
    }
    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword) {
      return next(createHttpError(404, "Invalid Email or Password"));
    }
    const jwtSecretKey = config.jwt_scret_key as string;
    const payload = { sub: user._id };
    const token = jwt.sign(payload, jwtSecretKey, { expiresIn: "1d" });
    return res
      .status(200)
      .cookie("sessionId", token, { httpOnly: true })
      .setHeader("token", token)
      .send({
        message: "Logged in successfull",
        token: config.env === "DEV" && token,
      });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong in loginUser API!"));
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById({ _id: req.userId }).select(
      "-password -updatedAt"
    );
    res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong in getUser API!"));
  }
};
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, bio, fname, lname } = req.body;
    const user = await User.findByIdAndUpdate(
      { _id: req.userId },
      { $set: { bio, username, fname, lname } },
      { new: true }
    );
    res.status(200).send({ message: "user profile updated successfully" });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong in getUser API!"));
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password, newPassword } = req.body;
    const user = await User.findById({ _id: req.userId });
    if (!user) {
      return next(createHttpError(404, "User does not exist"));
    }
    const verifyPassword = await bcrypt.compare(
      password,
      user?.password as string
    );
    if (!verifyPassword) {
      return next(createHttpError(404, "Invalid Current Password"));
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.save();
    return res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong in getUser API!"));
  }
};
