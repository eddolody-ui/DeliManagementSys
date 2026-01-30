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
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const generateToken_1 = require("../utils/generateToken");
const catchAsync_1 = require("../utils/catchAsync");
const router = (0, express_1.Router)();
// Login route
router.post('/login', (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    const user = yield User_1.default.findOne({ username });
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = yield user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const { accessToken, refreshToken } = (0, generateToken_1.generateJwtTokens)(user._id);
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.json({
        message: 'Login successful',
        user: {
            id: user._id,
            username: user.username,
            role: user.role
        },
        accessToken
    });
})));
// Register route (for seeding users)
router.post('/register', (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required' });
    }
    if (!['Admin', 'Operation', 'Finance'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }
    const existingUser = yield User_1.default.findOne({ username });
    if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
    }
    const user = new User_1.default({ username, password, role });
    yield user.save();
    res.status(201).json({
        message: 'User created successfully',
        user: {
            id: user._id,
            username: user.username,
            role: user.role
        }
    });
})));
// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout successful' });
});
exports.default = router;
