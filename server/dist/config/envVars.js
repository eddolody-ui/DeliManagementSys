"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV_VARS = void 0;
require("dotenv/config");
exports.ENV_VARS = {
    PORT: process.env.PORT || 5000,
    CLIENT_URL: process.env.CLIENT_URL || "https://retailshop-duv7.onrender.com",
    MONGO_URI: process.env.MONGO_URI,
    NODE_ENV: process.env.NODE_ENV,
    ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET,
    REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET,
};
