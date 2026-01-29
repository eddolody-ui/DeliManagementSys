import { Router } from "express";
import { Shipment, saveShipment, Order } from "./config/db";
import mongoose from "mongoose";
const router = Router();

// Create new route
router.post("/", async (req, res) => {
  try {
    const savedShip = await saveShipment(req.body);
    res.status(201).json(savedShip);
  } catch (error) {
    res.status(400).json({ message: "Shipment save failed", error });
  }
  console.log("CREATE SHIPMENT BODY:", req.body);
});


// Get all routes
router.get("/", async (req, res) => {
  try {
    // Populate orders so frontend can see order statuses for progress bar
    const shipments = await Shipment.find({}).populate("orders");
    res.json(shipments);
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
      route = await Shipment.findById(id).populate("orders");
    }

    // If not found by _id, try to find by RouteId (custom string)
    if (!route) {
      route = await Shipment.findOne({ ShipmentId: id }).populate("orders");
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

router.put("/:id", async (req, res) => {
  try {
    const { trackingId } = req.body;
    console.log("BODY:", req.body);
    console.log("PARAM:", req.params.id);
    const order = await Order.findOne({ TrackingId: trackingId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.Status === "Delivered") {
      return res.status(400).json({ message: "Cannot add shipment: Order is already delivered." });
    }

    // Try to find shipment by ShipmentId or _id
    let shipment = await Shipment.findOne({ ShipmentId: req.params.id });
    if (!shipment && mongoose.Types.ObjectId.isValid(req.params.id)) {
      shipment = await Shipment.findById(req.params.id);
    }
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // Ensure orders is an array of ObjectIds
    const orderIdStr = order._id.toString();
    const shipmentOrderIds = Array.isArray(shipment.orders)
      ? shipment.orders.map((oid: any) => oid.toString())
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
    if (!Array.isArray(shipment.log)) shipment.log = [];
    shipment.log.push({
      status: "Order Added",
      message: `Order ${order.TrackingId} added to shipment`,
      timestamp: new Date(),
    });

    // Update order status and log
    order.Status = "Add To Shipment";
    if (!Array.isArray(order.log)) order.log = [];
    order.log.push({
      status: "Add To Shipment",
      message: `Order added to shipment ${shipment.ShipmentId}`,
      timestamp: new Date(),
      createdBy: req.body.createdBy || "system"
    });
    await order.save();

    await shipment.save();

    res.json({
      message: "Order added to shipment and status updated to In Route",
      shipment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
