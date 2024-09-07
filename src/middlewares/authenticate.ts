import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import config from "../config/config";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ").at(-1);
    const jwtSecretKey = config.jwt_scret_key as string;
    // console.log(token);
    if (!token) {
      return next(createHttpError(401, "Unauthorized access"));
    }
    const verifyToken = jwt.verify(token, jwtSecretKey);
    if (!verifyToken) {
      return next(createHttpError(401, "Unauthorized access"));
    }
    // console.log(verifyToken);
    req.userId = verifyToken.sub as string;
    next();
  } catch (error) {
    console.log(error);
    next(createHttpError(500, "Unauthorized access"));
  }
};
