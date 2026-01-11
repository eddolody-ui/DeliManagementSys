"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        // restore proper prototype chain
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
