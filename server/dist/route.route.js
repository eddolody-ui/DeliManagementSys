"use strict";
import { Router } from "express";
import { DeliRoute, saveDeliRoute } from "./config/db";
import mongoose from "mongoose";

const router = Router();

/**
 * POST / - Create DeliRoute
 */
router.post("/", async (req, res) => {
  try {
    const saved = await saveDeliRoute(req.body);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Route save failed:", error);
    res.status(400).json({ message: "Route save failed", error });
  }
});

/**
 * GET / - List all routes
 */
router.get("/", async (req, res) => {
  try {
    const routes = await DeliRoute.find({}).sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    console.error("Failed to fetch routes:", error);
    res.status(500).json({ message: "Failed to fetch routes", error });
  }
});

/**
 * GET /:id - Get route by id or RouteId
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let route = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      route = await DeliRoute.findById(id);
    }
    if (!route) {
      route = await DeliRoute.findOne({ RouteId: id });
    }
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json(route);
  } catch (error) {
    console.error("Failed to fetch route:", error);
    res.status(500).json({ message: "Failed to fetch route", error });
  }
});

export default router;
