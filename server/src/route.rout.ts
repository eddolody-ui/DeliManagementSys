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

router.put("/:routeId", async (req, res) => {
  try {
    const { trackingId } = req.body;
    console.log("BODY:", req.body); 
    console.log("PARAM:", req.params.routeId);
    const order = await Order.findOne({ TrackingId: trackingId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }


    // Try to find route by RouteId or _id
    let route = await DeliRoute.findOne({ RouteId: req.params.routeId });
    if (!route && mongoose.Types.ObjectId.isValid(req.params.routeId)) {
      route = await DeliRoute.findById(req.params.routeId);
    }
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Ensure orders is an array of ObjectIds
    const orderIdStr = order._id.toString();
    const routeOrderIds = Array.isArray(route.orders)
      ? route.orders.map((oid: any) => oid.toString())
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
router.get("/:id", async (req: import("express").Request, res: import("express").Response) => {
  try {
    const id: string = req.params.id;

    // Try to find by MongoDB ObjectId (_id)
    let route = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      route = await DeliRoute.findById(id).populate("orders");
    }

    // If not found by _id, try to find by RouteId (custom string)
    if (!route) {
      route = await DeliRoute.findOne({ RouteId: id }).populate("orders");
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
