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
// Create new route
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const savedShip = yield (0, db_1.saveShipment)(req.body);
        res.status(201).json(savedShip);
    }
    catch (error) {
        res.status(400).json({ message: "Shipment save failed", error });
    }
    console.log("CREATE SHIPMENT BODY:", req.body);
}));
// Get all routes
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Populate orders so frontend can see order statuses for progress bar
        const shipments = yield db_1.Shipment.find({}).populate("orders");
        res.json(shipments);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch routes", error });
    }
}));
// Get route by _id or RouteId
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        // Try to find by MongoDB ObjectId (_id)
        let route = null;
        if (mongoose_1.default.Types.ObjectId.isValid(id)) {
            route = yield db_1.Shipment.findById(id).populate("orders");
        }
        // If not found by _id, try to find by RouteId (custom string)
        if (!route) {
            route = yield db_1.Shipment.findOne({ ShipmentId: id }).populate("orders");
        }
        if (!route) {
            return res.status(404).json({ message: "Route not found" });
        }
        res.json(route); // return **single object**, not array
    }
    catch (error) {
        console.error("Error fetching route:", error);
        res.status(500).json({ message: "Failed to fetch route", error });
    }
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trackingId } = req.body;
        console.log("BODY:", req.body);
        console.log("PARAM:", req.params.id);
        const order = yield db_1.Order.findOne({ TrackingId: trackingId });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.Status === "Delivered") {
            return res.status(400).json({ message: "Cannot add shipment: Order is already delivered." });
        }
        // Try to find shipment by ShipmentId or _id
        let shipment = yield db_1.Shipment.findOne({ ShipmentId: req.params.id });
        if (!shipment && mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            shipment = yield db_1.Shipment.findById(req.params.id);
        }
        if (!shipment) {
            return res.status(404).json({ message: "Shipment not found" });
        }
        // Ensure orders is an array of ObjectIds
        const orderIdStr = order._id.toString();
        const shipmentOrderIds = Array.isArray(shipment.orders)
            ? shipment.orders.map((oid) => oid.toString())
            : [];
        if (shipmentOrderIds.includes(orderIdStr)) {
            // If already present, update totalAmount only (or skip)
            return res.json({
                message: "Order already in shipment, no changes made",
                shipment,
            });
        }
        shipment.orders.push(order._id);
        // Add log entry for this shipment change
        if (!Array.isArray(shipment.log))
            shipment.log = [];
        shipment.log.push({
            status: "Order Added",
            message: `Order ${order.TrackingId} added to shipment`,
            timestamp: new Date(),
        });
        // Update order status and log
        order.Status = "Add To Shipment";
        if (!Array.isArray(order.log))
            order.log = [];
        order.log.push({
            status: "Add To Shipment",
            message: `Order added to shipment ${shipment.ShipmentId}`,
            timestamp: new Date(),
            createdBy: req.body.createdBy || "system"
        });
        yield order.save();
        yield shipment.save();
        res.json({
            message: "Order added to shipment and status updated to In Route",
            shipment,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}));
exports.default = router;
