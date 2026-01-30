"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const db_1 = require("./config/db");
const envVars_1 = require("./config/envVars");
const PORT = envVars_1.ENV_VARS.PORT || 5000;
app_1.app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});
app_1.app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from backend!" });
});
app_1.app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.connectDB)();
    console.log(`Server is running on PORT : ${PORT}`);
}));
