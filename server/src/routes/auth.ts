import { Router } from 'express';
import { generateToken, type AuthUser } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

// Simple in-memory user store (in production, use database)
const users: Record<string, { username: string; password: string }> = {
  admin: { username: 'admin', password: 'admin123' },
};

router.post(
  '/login',
  asyncHandler((req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError(400, 'Username and password required');
    }

    const user = users[username];
    if (!user || user.password !== password) {
      throw new AppError(401, 'Invalid credentials');
    }

    const authUser: AuthUser = {
      id: username,
      username,
      role: 'admin',
    };

    const token = generateToken(authUser);
    res.json({
      success: true,
      data: { token, user: authUser },
    });
  })
);

router.post(
  '/register',
  asyncHandler((req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError(400, 'Username and password required');
    }

    if (users[username]) {
      throw new AppError(409, 'User already exists');
    }

    users[username] = { username, password };

    const authUser: AuthUser = {
      id: username,
      username,
      role: 'user',
    };

    const token = generateToken(authUser);
    res.json({
      success: true,
      data: { token, user: authUser },
    });
  })
);

router.post('/logout', (req, res) => {
  res.json({ success: true, data: null });
});

export default router;
