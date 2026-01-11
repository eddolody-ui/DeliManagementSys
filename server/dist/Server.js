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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const order_rout_1 = __importDefault(require("./order.rout"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // ❗ frontend ချိတ်ဖို့
app.use(express_1.default.json()); // JSON body read
app.use("/api/orders", order_rout_1.default);
const PORT = 5000;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, db_1.connectDB)();
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    });
}
start();
