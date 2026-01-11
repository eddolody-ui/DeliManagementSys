import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import orderRoutes from "./order.rout";

const app = express();

app.use(cors());            // ❗ frontend ချိတ်ဖို့
app.use(express.json());    // JSON body read

app.use("/api/orders", orderRoutes);

const PORT = 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
}

start();
