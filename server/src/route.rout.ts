import { Router } from "express";
import { DeliRoute, saveDeliRoute } from "./config/db";
import mongoose from "mongoose";
import { Order } from "./config/db";
const router = Router();

// Create new route
router.post("/", async (req, res) => {
  try {
    const savedRoute = await saveDeliRoute(req.body);
    res.status(201).json(savedRoute);
  } catch (error) {
    res.status(400).json({ message: "Route save failed", error });
  }
});

router.put("/:routeId/add-order", async (req, res) => {
  try {
    const { trackingId } = req.body;

    const order = await Order.findOne({ TrackingId: trackingId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const route = await DeliRoute.findOne({ RouteId: req.params.routeId });
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // prevent duplicate
    if (route.orders.includes(order._id)) {
      return res.status(400).json({ message: "Order already in route" });
    }

    route.orders.push(order._id);
    route.totalAmount += order.Amount;

    await route.save();

    res.json({
      message: "Order added to route",
      route,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all routes
router.get("/", async (req, res) => {
  try {
    const routes = await DeliRoute.find({});
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch routes", error });
  }
});

// Get route by _id or RouteId
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by MongoDB ObjectId (_id)
    let route = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      route = await DeliRoute.findById(id);
    }

    // If not found by _id, try to find by RouteId (custom string)
    if (!route) {
      route = await DeliRoute.findOne({ RouteId: id });
    }

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.json(route); // return **single object**, not array
  } catch (error) {
    console.error("Error fetching route:", error);
    res.status(500).json({ message: "Failed to fetch route", error });
  }
});

export default router;
