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
exports.User = exports.saveShipment = exports.Shipment = exports.saveDeliRoute = exports.DeliRoute = exports.saveShipper = exports.Shipper = exports.saveOrder = exports.Order = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/* =======================
   MongoDB Connection
======================= */
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conn = yield mongoose_1.default.connect("mongodb+srv://luke:minthway@cluster0.cd2htw6.mongodb.net/databases"
        // ENV_VARS.MONGO_URI ကိုသုံးလည်းရ
        );
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error("❌ MongoDB error:", error.message);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
/* =======================
   Order Schema
======================= */
/**
 * Order Schema Definition
 *
 * Order documents အတွက် MongoDB schema ကို define လုပ်သည်။
 * Structured data model ကို create လုပ်ရန် Mongoose ကို အသုံးပြုသည်။
 *
 * Relationships:
 * - Client serviceApi.ts ၏ OrderData interface နှင့် fields များ match ဖြစ်သည်
 * - Database operations အတွက် Order model မှ အသုံးပြုသည်
 * - Timestamps သည် createdAt နှင့် updatedAt fields များကို automatically ထည့်သည်
 * - MongoDB ၏ Order collection နှင့် connected ဖြစ်သည်
 */
const OrderSchema = new mongoose_1.default.Schema({
    TrackingId: { type: String, required: true },
    CustomerName: { type: String, required: true },
    CustomerContact: { type: Number, required: true },
    CustomerAddress: { type: String, required: true },
    Amount: { type: Number, required: true },
    Type: { type: String, required: true },
    Note: { type: String },
    shipperId: { type: mongoose_1.default.Schema.Types.Mixed, ref: 'Shipper', required: false },
    Status: { type: String,
        enum: ["Pending", "Hub Inbound", "Arrive At Softing Hub", "Add To Shipment", "In Route", "Delivered", "Return To Sender", "Cancelled"],
        default: "Pending" },
    log: [
        {
            status: { type: String },
            timestamp: { type: Date, default: Date.now },
            createdAt: { type: Date, default: Date.now },
            createdBy: { type: String },
            message: { type: String }
        }
    ]
}, { timestamps: true });
/* =======================
   Order Model (Safe)
======================= */
/**
 * Order Model
 *
 * Order collection အတွက် Mongoose model။ Model re-compilation errors ကို prevent လုပ်ရန်
 * singleton pattern ကို အသုံးပြုသည်။
 *
 * Relationships:
 * - OrderSchema definition မှ created ဖြစ်သည်
 * - New documents ကို create လုပ်ရန် saveOrder function မှ အသုံးပြုသည်
 * - Router.get("/") မှ all orders ကို fetch လုပ်ရန် queried ဖြစ်သည်
 * - Router.get("/:trackingId") မှ individual orders ကို fetch လုပ်ရန် queried ဖြစ်သည်
 */
const Order = mongoose_1.default.models.Order || mongoose_1.default.model("Order", OrderSchema);
exports.Order = Order;
/* =======================
   Save Order
======================= */
/**
 * saveOrder Function
 *
 * New order document ကို MongoDB သို့ create လုပ်ပြီး save လုပ်သည်။
 *
 * Relationships:
 * - Router.post("/") route handler မှ call လုပ်သည်
 * - Client createOrder API call မှ orderData ကို receive လုပ်သည်
 * - Order model ကို အသုံးပြု၍ new Order document ကို create လုပ်သည်
 * - Route handler သို့ saved document ကို return လုပ်သည်
 * - Client Order table တွင် display လုပ်ရန် data ကို eventually ပို့သည်
 */
const saveOrder = (orderData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Add initial log entry for order creation
        if (!orderData.log)
            orderData.log = [];
        orderData.log.push({
            status: orderData.Status || "Pending",
            message: "Order created",
            timestamp: new Date(),
            createdBy: orderData.createdBy || "system"
        });
        const order = new Order(orderData);
        return yield order.save();
    }
    catch (error) {
        console.error("❌ Order save error:", error);
        throw error;
    }
});
exports.saveOrder = saveOrder;
//section for Shipper schema and model
const ShipperSchema = new mongoose_1.default.Schema({
    ShipperId: { type: String, required: true },
    ShipperName: { type: String, required: true },
    ShipperContact: { type: Number, required: true },
    ShipperAddress: { type: String, required: true },
    PickUpAddress: { type: String, required: true },
    BillingType: { type: String, required: true },
    Note: { type: String },
}, { timestamps: true });
const Shipper = mongoose_1.default.models.Shipper || mongoose_1.default.model("Shipper", ShipperSchema);
exports.Shipper = Shipper;
const saveShipper = (shipperData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shipper = new Shipper(shipperData);
        return yield shipper.save();
    }
    catch (error) {
        console.error("❌ Shipper save error:", error);
        throw error;
    }
});
exports.saveShipper = saveShipper;
//section for DeliRoute schema and model
const RouteSchema = new mongoose_1.default.Schema({
    RouteId: {
        type: String,
        default: function () {
            return Math.floor(100000 + Math.random() * 900000).toString();
        },
    },
    Hub: { type: String, required: true },
    AssignPersonName: { type: String, required: true },
    DateCreated: { type: Date, default: Date.now },
    orders: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Order",
            default: [],
        },
    ],
    totalAmount: { type: Number, default: 0 },
    // Route process log
    log: [
        {
            status: { type: String },
            message: { type: String },
            timestamp: { type: Date, default: Date.now },
            createdBy: { type: String },
        }
    ],
}, { timestamps: true });
const DeliRoute = mongoose_1.default.models.DeliRoute || mongoose_1.default.model("DeliRoute", RouteSchema);
exports.DeliRoute = DeliRoute;
const saveDeliRoute = (routeData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const route = new DeliRoute(routeData);
        return yield route.save();
    }
    catch (error) {
        console.error("❌ Route save error:", error);
        throw error;
    }
});
exports.saveDeliRoute = saveDeliRoute;
const ShipmentSchema = new mongoose_1.default.Schema({
    ShipmentId: {
        type: String,
        default: function () {
            return Math.floor(100000 + Math.random() * 900000).toString();
        },
    },
    FromHub: { type: String, required: true },
    ToHub: { type: String, required: true },
    DateCreated: { type: Date, default: Date.now },
    orders: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Order",
            default: [],
        },
    ],
    // Shipment process log
    log: [
        {
            status: { type: String },
            message: { type: String },
            timestamp: { type: Date, default: Date.now },
            createdBy: { type: String },
        }
    ],
}, { timestamps: true });
const Shipment = mongoose_1.default.models.Shipment || mongoose_1.default.model("Shipment", ShipmentSchema);
exports.Shipment = Shipment;
const saveShipment = (ShipmentData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shipment = new Shipment(ShipmentData);
        return yield shipment.save();
    }
    catch (error) {
        console.error(" Shipment save error:", error);
        throw error;
    }
});
exports.saveShipment = saveShipment;
// User schema and model
const UserSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
});
const User = mongoose_1.default.models.User || mongoose_1.default.model("User", UserSchema);
exports.User = User;
