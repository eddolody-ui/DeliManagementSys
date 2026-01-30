import { Router } from 'express';
import User from '../models/User';
import { generateJwtTokens } from '../utils/generateToken';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// Login route
router.post('/login', catchAsync(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { accessToken, refreshToken } = generateJwtTokens(user._id);

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
}));

// Register route (for seeding users)
router.post('/register', catchAsync(async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required' });
  }

  if (!['Admin', 'Operation', 'Finance'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const user = new User({ username, password, role });
  await user.save();

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  });
}));

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logout successful' });
});

export default router;
