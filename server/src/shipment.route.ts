import { Router } from "express";
import { Shipment, saveShipment } from "./config/db";
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

export default router;
