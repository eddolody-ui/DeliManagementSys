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
const db_2 = require("./config/db");
const router = (0, express_1.Router)();
// Create new route
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const savedRoute = yield (0, db_1.saveDeliRoute)(req.body);
        res.status(201).json(savedRoute);
    }
    catch (error) {
        res.status(400).json({ message: "Route save failed", error });
    }
}));
router.put("/:routeId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { trackingId } = req.body;
        console.log("BODY:", req.body);
        console.log("PARAM:", req.params.routeId);
        const order = yield db_2.Order.findOne({ TrackingId: trackingId });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.Status === "Delivered") {
            return res.status(400).json({ message: "Cannot add route: Order is already delivered." });
        }
        // Try to find route by RouteId or _id
        let route = yield db_1.DeliRoute.findOne({ RouteId: req.params.routeId });
        if (!route && mongoose_1.default.Types.ObjectId.isValid(req.params.routeId)) {
            route = yield db_1.DeliRoute.findById(req.params.routeId);
        }
        if (!route) {
            return res.status(404).json({ message: "Route not found" });
        }
        // Ensure orders is an array of ObjectIds
        const orderIdStr = order._id.toString();
        const routeOrderIds = Array.isArray(route.orders)
            ? route.orders.map((oid) => oid.toString())
            : [];
        if (routeOrderIds.includes(orderIdStr)) {
            // If already present, update totalAmount only (or skip)
            return res.json({
                message: "Order already in route, no changes made",
                route,
            });
        }
        route.orders.push(order._id);
        route.totalAmount += order.Amount;
        // Add log entry for this route change
        if (!Array.isArray(route.log))
            route.log = [];
        route.log.push({
            status: "Order Added",
            message: `Order ${order.TrackingId} added to route`,
            timestamp: new Date(),
        });
        // Update order status and log
        order.Status = "In Route";
        if (!Array.isArray(order.log))
            order.log = [];
        order.log.push({
            status: "In Route",
            message: `Order added to route ${route.RouteId}`,
            timestamp: new Date(),
            createdBy: req.body.createdBy || "system"
        });
        yield order.save();
        yield route.save();
        res.json({
            message: "Order added to route and status updated to In Route",
            route,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}));
// Get all routes
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Populate orders so frontend can see order statuses for progress bar
        const routes = yield db_1.DeliRoute.find({}).populate("orders");
        res.json(routes);
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
            route = yield db_1.DeliRoute.findById(id).populate("orders");
        }
        // If not found by _id, try to find by RouteId (custom string)
        if (!route) {
            route = yield db_1.DeliRoute.findOne({ RouteId: id }).populate("orders");
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
exports.default = router;
