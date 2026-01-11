"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const envVars_1 = require("./config/envVars");
// import { errorHandler } from "./middlewares/errorHandler";
const order_rout_1 = __importDefault(require("./order.rout"));
const shipper_rout_1 = __importDefault(require("./shipper.rout"));
const route_rout_1 = __importDefault(require("./route.rout"));
exports.app = (0, express_1.default)();
// ===== Middleware setup =====
exports.app
    .use((0, morgan_1.default)("dev"))
    .use((0, express_1.urlencoded)({ extended: true }))
    .use((0, express_1.json)({
    verify: (req, _res, buf) => {
        req.rawBody = buf.toString();
    },
}))
    .use((0, cookie_parser_1.default)())
    .use((0, cors_1.default)({
    origin: function (origin, callback) {
        const whiteList = [
            envVars_1.ENV_VARS.CLIENT_URL,
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "https://retailshop-k8s1.onrender.com",
        ];
        if (!origin)
            return callback(null, true);
        if (whiteList.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log("CORS blocked origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}))
    .use((0, helmet_1.default)())
    .use((0, compression_1.default)());
// ===== API routes =====
exports.app.use("/api/orders", order_rout_1.default);
exports.app.use("/api/shippers", shipper_rout_1.default);
exports.app.use("/api/routes", route_rout_1.default);
exports.app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});
// ===== Global error handler (last) =====
exports.app.use((err, req, res, _next) => {
    console.error("Global error handler:", err, "rawBody:", req.rawBody);
    res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
});
// ===== Optional: custom error handler =====
// app.use(errorHandler);
