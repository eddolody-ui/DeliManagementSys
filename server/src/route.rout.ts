import { Router } from "express";
import { DeliRoute, Order, saveDeliRoute, saveShipper } from "./config/db";
import { Shipper } from "./config/db";
import mongoose from "mongoose";

const router = Router();
router.post("/", async (req, res) => {
  try {
    const savedRoute = await saveDeliRoute(req.body);
    res.status(201).json(savedRoute);
  } catch (error) {
    res.status(400).json({ message: "Shipper save failed", error });
  }
});

router.get("/", async (req, res) => {
  try {
    const routes = await DeliRoute.find({});
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shippers", error });
  }
});

router.get("/:id/routes", async (req, res) => {
  try {
    const RouteId = req.params.id;
    const query = mongoose.Types.ObjectId.isValid(RouteId)
      ? { RouteId }  // if using ObjectId
      : { RouteId: RouteId }; // if using string

    const route = await DeliRoute.find(query).sort({ createdAt: -1 });
    res.json(route);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
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