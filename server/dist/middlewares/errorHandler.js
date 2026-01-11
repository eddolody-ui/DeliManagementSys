"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const envVars_1 = require("../config/envVars");
const AppError_1 = require("../utils/AppError");
const errorHandler = (err, req, res, next) => {
    let statusCode = err instanceof AppError_1.AppError ? err.statusCode : 500;
    let message = err.message || "Internal Server Error";
    // Mongoose validation error
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        const errors = Object.values(err.errors).map((el) => el.message);
        message = errors.join(", ");
        statusCode = 400;
    }
    res.status(statusCode).json({
        success: false,
        message,
        stack: envVars_1.ENV_VARS.NODE_ENV === "development" && err.stack,
    });
};
exports.errorHandler = errorHandler;
