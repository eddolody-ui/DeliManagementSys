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
const db_2 = require("./config/db");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
/**
 * POST / - Create Shipper Route
 *
 * Client form data မှ database တွင် အသစ်စက်စက် shipper ကို create လုပ်သည်။
 *
 * Relationships:
 * - Client serviceApi.ts ၏ createShipper() function မှ data ကို receive လုပ်သည်
 * - Database config မှ saveShipper() function ကို call လုပ်သည်
 * - Frontend မှ ShipperData interface structure ကို အသုံးပြုသည်
 * - Confirmation အတွက် client သို႔ created shipper ကိႏ၀ငယခန။
 * Client form data မှ database တွင် အသစ်စက်စက် shipper ကို create လုပ်သည်။
 *
 * Relationships:
 * - Client serviceApi.ts ၏ createShipper() function မှ data ကို receive လုပ်သည်
 * - Database config မှ saveShipper() function ကို call လုပ်သည်
 * - Frontend မှ ShipperData interface structure ကို အသုံးပြုသည်
 * - Confirmation အတွက် client သို့ created shipper ကို return လုပ်သည်
 * - MongoDB Shipper collection နှင့် connected ဖြစ်သည်
 */
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const savedShipper = yield (0, db_1.saveShipper)(req.body);
        res.status(201).json(savedShipper);
    }
    catch (error) {
        res.status(400).json({ message: "Shipper save failed", error });
    }
}));
/**
 * GET / - Get All Shippers Route
 *
 * Shippers table တွင် display လုပ်ရန် database မှ shipper အားလုံးကို retrieve လုပ်သည်။
 *
 * Relationships:
 * - Client serviceApi.ts ၏ getShippers() function သို့ respond လုပ်သည်
 * - Shipper.find({}) ဖြင့် MongoDB Shipper collection ကို query လုပ်သည်
 * - Client သို့ ShipperData[] array ကို return လုပ်သည်
 * - Shipper page table တွင် data ကို display လုပ်ရန် အသုံးပြုသည်
 */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shippers = yield db_2.Shipper.find({});
        res.json(shippers);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch shippers", error });
    }
}));
/**
 * GET /:id - Get Shipper by ID Route
 *
 * ၎င်း၏ ID ဖြင့် specific shipper ကို retrieve လုပ်သည်။
 *
 * Relationships:
 * - Individual shipper details ကို fetch လုပ်ရန် client မှ အသုံးပြုနိုင်သည်
 * - ID filter ဖြင့် Shipper.findById() ကို အသုံးပြုသည်
 * - Single shipper object ကို return လုပ်သည် သို့မဟုတ် မရှိပါက 404 ကို return လုပ်သည်
 * - Order detail page နှင့် connect လုပ်နိုင်သည်
 */
// GET orders for a shipper
router.get("/:id/orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shipperId = req.params.id;
        const query = mongoose_1.default.Types.ObjectId.isValid(shipperId)
            ? { shipperId } // if using ObjectId
            : { shipperId: shipperId }; // if using string
        const orders = yield db_1.Order.find(query).sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Try to find by _id first (MongoDB ObjectId)
        let shipper = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            shipper = yield db_2.Shipper.findById(id);
        }
        // If not found by _id, try to find by ShipperId (custom string field)
        if (!shipper) {
            shipper = yield db_2.Shipper.findOne({ ShipperId: id });
        }
        if (!shipper) {
            return res.status(404).json({ message: "Shipper not found" });
        }
        res.json(shipper);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch shipper", error });
    }
}));
// GET /api/orders/pending/count
router.get("/orders/pending/count", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pendingCount = yield db_1.Order.countDocuments({ Status: "Pending" });
        res.json({ pendingCount });
    }
    catch (error) {
        console.error("Error fetching pending orders count:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
exports.default = router;
