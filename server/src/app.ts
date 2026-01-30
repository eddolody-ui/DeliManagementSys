import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json, urlencoded } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { ENV_VARS } from "./config/envVars";
// import { errorHandler } from "./middlewares/errorHandler";
import orderRoutes from "./order.rout";
import shipperRoutes from "./shipper.rout";
import routeRoutes from "./route.rout";
import shipmentRoutes from "./shipment.route";
import authRoutes from "./routes/auth";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shippers", shipperRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/shipments", shipmentRoutes);

// app.use(errorHandler);

export { app };
