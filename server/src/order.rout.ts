import { Router } from "express";
import { saveOrder, Order } from "./config/db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "./models/User";
import { ENV_VARS } from "./config/envVars";

const ALLOWED_EDITOR_ROLES = ["Admin", "Finance"] as const;

const getUserRoleFromToken = async (authorizationHeader?: string) => {
  if (!authorizationHeader?.startsWith("Bearer ")) return null;

  const token = authorizationHeader.split(" ")[1];
  if (!token || !ENV_VARS.ACCESS_JWT_SECRET) return null;

  let decoded: JwtPayload | string;
  try {
    decoded = jwt.verify(token, ENV_VARS.ACCESS_JWT_SECRET) as JwtPayload | string;
  } catch {
    return null;
  }

  if (!decoded || typeof decoded === "string" || !decoded.userId) return null;

  const user = await User.findById(decoded.userId).select("role");
  return user?.role ?? null;
};

const ensureEditorAccess = async (authorizationHeader?: string) => {
  const role = await getUserRoleFromToken(authorizationHeader);
  if (!role) return { allowed: false, status: 401, message: "Unauthorized" };
  if (!ALLOWED_EDITOR_ROLES.includes(role as (typeof ALLOWED_EDITOR_ROLES)[number])) {
    return { allowed: false, status: 403, message: "Only Admin and Finance can update orders" };
  }
  return { allowed: true, status: 200, message: "ok" };
};
/**
 * PATCH /:trackingId/status - Update Order Status and Log
 *
 * Updates the status of an order and appends a log entry.
 *
 * Relationships:
 * - Called from frontend when status is changed
 * - Updates order status and pushes log entry
 */
const router = Router();
router.patch('/:trackingId/status', async (req, res) => {
  try {
    const access = await ensureEditorAccess(req.headers.authorization);
    if (!access.allowed) {
      return res.status(access.status).json({ message: access.message });
    }

    const { status, message, createdBy } = req.body;
    const order = await Order.findOne({ TrackingId: req.params.trackingId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.Status = status;
    order.log = order.log || [];
    order.log.push({
      status,
      message: message || `Status changed to ${status}`,
      timestamp: new Date(),
      createdBy: createdBy || 'system',
    });
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ message: 'Failed to update status', error });
  }
});

/**
 * PATCH /:trackingId - Update editable order information
 *
 * Updates base order fields (customer info, amount, address, etc.) and appends a log entry.
 */
router.patch("/:trackingId", async (req, res) => {
  try {
    const access = await ensureEditorAccess(req.headers.authorization);
    if (!access.allowed) {
      return res.status(access.status).json({ message: access.message });
    }

    const allowedFields = [
      "CustomerName",
      "CustomerContact",
      "CustomerAddress",
      "Amount",
      "Type",
      "Note",
      "TownShip",
      "DeliFee",
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    const order = await Order.findOne({ TrackingId: req.params.trackingId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    Object.assign(order, updates);
    order.log = order.log || [];
    order.log.push({
      status: order.Status,
      message: "Order information updated",
      timestamp: new Date(),
      createdBy: req.body?.createdBy || "system",
    });

    await order.save();
    res.json(order);
  } catch (error: any) {
    console.error("Order info update error:", error);
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ message: "Invalid order data", error: error?.message });
    }
    res.status(500).json({ message: "Failed to update order information", error });
  }
});

/**
 * POST / - Create Order Route
 * 
 * Client form data မှ database တွင် အသစ်စက်စက် order ကို create လုပ်သည်။
 * 
 * Relationships:
 * - Client serviceApi.ts ၏ createOrder() function မှ data ကို receive လုပ်သည်
 * - Database config မှ saveOrder() function ကို call လုပ်သည်
 * - Frontend မှ OrderData interface structure ကို အသုံးပြုသည်
 * - Confirmation အတွက် client သို့ created order ကို return လုပ်သည်
 * - MongoDB Order collection နှင့် connected ဖြစ်သည်
 */
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/orders body:", req.body);
    // Accept both ObjectId and string for shipperId
    // If shipperId is a valid ObjectId, convert it, else leave as string
    if (req.body.shipperId) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(req.body.shipperId)) {
        req.body.shipperId = new mongoose.Types.ObjectId(req.body.shipperId);
      } // else: leave as string for custom ShipperId
    }
    const savedOrder = await saveOrder(req.body);
    res.status(201).json(savedOrder);
  } catch (error: any) {
    console.error("Order save error details:", error);
    const errMsg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
    res.status(400).json({ message: "Order save failed", error: errMsg });
  }
});


/**
 * GET / - Get All Orders Route
 * 
 * Orders table တွင် display လုပ်ရန် database မှ order အားလုံးကို retrieve လုပ်သည်။
 * 
 * Relationships:
 * - Client serviceApi.ts ၏ getOrders() function သို့ respond လုပ်သည်
 * - Order.find({}) ဖြင့် MongoDB Order collection ကို query လုပ်သည်
 * - Client သို့ OrderData[] array ကို return လုပ်သည်
 * - DataTableDemo component တွင် data ကို render လုပ်သည်
 * - Order page က order list ကို display လုပ်ရန် အသုံးပြုသည်
 */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({}); // Remove .populate('shipperId')
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
});

/**
 * GET /:trackingId - Get Order by Tracking ID Route
 * 
 * ၎င်း၏ tracking ID ဖြင့် specific order ကို retrieve လုပ်သည်။
 * 
 * Relationships:
 * - Individual order details ကို fetch လုပ်ရန် client မှ အသုံးပြုနိုင်သည်
 * - TrackingId filter ဖြင့် Order.findOne() ကို အသုံးပြုသည်
 * - Single order object ကို return လုပ်သည် သို့မဟုတ် မရှိပါက 404 ကို return လုပ်သည်
 * - Order details page နှင့် connect လုပ်နိုင်သည် (လက်ရှိတွင် မရှိသေးပါ)
 */
router.get("/:trackingId", async (req, res) => {
  try {
    const order = await Order.findOne({
      TrackingId: req.params.trackingId,
    }); // Remove .populate('shipperId')

    if (!order) {
      return res.status(404).json({
        message: `Order with TrackingId '${req.params.trackingId}' not found`,
        trackingId: req.params.trackingId
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
