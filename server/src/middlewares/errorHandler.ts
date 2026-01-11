import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ENV_VARS } from "../config/envVars";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err instanceof AppError ? err.statusCode : 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    message = errors.join(", ");
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: ENV_VARS.NODE_ENV === "development" && err.stack,
  });
};

