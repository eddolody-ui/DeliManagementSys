import { Router } from "express";
import { Order, saveShipper } from "./config/db";
import { Shipper } from "./config/db";
import mongoose from "mongoose";

const router = Router();

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
router.post("/", async (req, res) => {
  try {
    const savedShipper = await saveShipper(req.body);
    res.status(201).json(savedShipper);
  } catch (error) {
    res.status(400).json({ message: "Shipper save failed", error });
  }
});

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
router.get("/", async (req, res) => {
  try {
    const shippers = await Shipper.find({});
    res.json(shippers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shippers", error });
  }
});

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
router.get("/:id/orders", async (req, res) => {
  try {
    const shipperId = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(shipperId)
      ? { shipperId }  // if using ObjectId
      : { shipperId: shipperId }; // if using string

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update shipper info by _id or custom ShipperId
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      "ShipperName",
      "ShipperContact",
      "ShipperAddress",
      "PickUpAddress",
      "BillingType",
      "Note",
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    let shipper = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      shipper = await Shipper.findByIdAndUpdate(id, { $set: updates }, { new: true });
    }

    if (!shipper) {
      shipper = await Shipper.findOneAndUpdate({ ShipperId: id }, { $set: updates }, { new: true });
    }

    if (!shipper) {
      return res.status(404).json({ message: "Shipper not found" });
    }

    res.json(shipper);
  } catch (error) {
    console.error("Shipper update error:", error);
    res.status(500).json({ message: "Failed to update shipper", error });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by _id first (MongoDB ObjectId)
    let shipper = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      shipper = await Shipper.findById(id);
    }

    // If not found by _id, try to find by ShipperId (custom string field)
    if (!shipper) {
      shipper = await Shipper.findOne({ ShipperId: id });
    }

    if (!shipper) {
      return res.status(404).json({ message: "Shipper not found" });
    }

    res.json(shipper);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shipper", error });
  }
});

// GET /api/orders/pending/count
router.get("/orders/pending/count", async (req, res) => {
  try {
    const pendingCount = await Order.countDocuments({ Status: "Pending" });
    res.json({ pendingCount });
  } catch (error) {
    console.error("Error fetching pending orders count:", error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
