import "dotenv/config";
import { app } from "./app";
import { connectDB } from "./config/db";
import { ENV_VARS } from "./config/envVars";
 
const PORT = ENV_VARS.PORT || 5000;

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on PORT : ${PORT}`);
});
