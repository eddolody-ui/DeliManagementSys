"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJwtTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const envVars_1 = require("../config/envVars");
const generateJwtTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, envVars_1.ENV_VARS.ACEESS_JWT_SECRET, {
        expiresIn: "15m",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, envVars_1.ENV_VARS.REFRESH_JWT_SECRET, {
        expiresIn: "30d",
    });
    return { accessToken, refreshToken };
};
exports.generateJwtTokens = generateJwtTokens;
