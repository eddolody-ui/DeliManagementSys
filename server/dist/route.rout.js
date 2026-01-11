"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("./config/db");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
/**
 * POST / - Create DeliRoute
 */
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saved = yield (0, db_1.saveDeliRoute)(req.body);
        res.status(201).json(saved);
    }
    catch (error) {
        console.error("Route save failed:", error);
        res.status(400).json({ message: "Route save failed", error });
    }
}));
/**
 * GET / - List all routes
 */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const routes = yield db_1.DeliRoute.find({}).sort({ createdAt: -1 });
        res.json(routes);
    }
    catch (error) {
        console.error("Failed to fetch routes:", error);
        res.status(500).json({ message: "Failed to fetch routes", error });
    }
}));
/**
 * GET /:id - Get route by id or RouteId
 */
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        let route = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            route = yield db_1.DeliRoute.findById(id);
        }
        if (!route) {
            route = yield db_1.DeliRoute.findOne({ RouteId: id });
        }
        if (!route)
            return res.status(404).json({ message: "Route not found" });
        res.json(route);
    }
    catch (error) {
        console.error("Failed to fetch route:", error);
        res.status(500).json({ message: "Failed to fetch route", error });
    }
}));
exports.default = router;
