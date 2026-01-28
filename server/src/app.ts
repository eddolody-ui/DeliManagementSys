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

export const app = express();

// ===== Middleware setup =====
app
  .use(morgan("dev"))
  .use(urlencoded({ extended: true }))
  .use(
    json({
      verify: (req: any, _res, buf: Buffer) => {
        req.rawBody = buf.toString();
      },
    })
  )
  .use(cookieParser())
  .use(
    cors({
      origin: function (
        origin: any,
        callback: (err: Error | null, origin?: any) => void
      ) {
        const whiteList = [
          ENV_VARS.CLIENT_URL,
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
        ];
        if (!origin) return callback(null, true);
        if (whiteList.includes(origin)) {
          callback(null, true);
        } else {
          console.log("CORS blocked origin:", origin);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  )
  .use(helmet())
  .use(compression());

// ===== API routes =====
app.use("/api/orders", orderRoutes);
app.use("/api/shippers", shipperRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/shipments", shipmentRoutes);


app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})

// ===== Global error handler (last) =====
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Global error handler:", err, "rawBody:", (req as any).rawBody);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
);

// ===== Optional: custom error handler =====
// app.use(errorHandler);
app.post("/api/test", (req, res) => {
  res.json({ test: "ok" });
});