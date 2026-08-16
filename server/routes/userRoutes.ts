import { Router } from 'express';
import { db } from '../db';
import { optionalAuth } from '../auth';

export const userRouter = Router();

// GET /api/v1/users (Search & list)
userRouter.get('/', optionalAuth, (req, res) => {
  const { search, status, limit = 20, page = 1 } = req.query;

  let filtered = db.users.map((u) => {
    const { passwordHash: _, ...safeUser } = u;
    return safeUser;
  });

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.fullName.toLowerCase().includes(s) ||
        u.username.toLowerCase().includes(s) ||
        (u.bio && u.bio.toLowerCase().includes(s))
    );
  }

  if (status && typeof status === 'string') {
    filtered = filtered.filter((u) => u.status === status);
  }

  const pageNum = Math.max(1, parseInt(String(page)) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 20));
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    total: filtered.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(filtered.length / limitNum),
    users: paginated,
  });
});

// GET /api/v1/users/:id
userRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const user = db.users.find((u) => u.id === id || u.username.toLowerCase() === id.toLowerCase());

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Foydalanuvchi topilmadi.',
      code: 'USER_NOT_FOUND',
    });
    return;
  }

  const { passwordHash: _, ...safeUser } = user;

  res.json({
    success: true,
    user: safeUser,
  });
});

// GET /api/v1/users/:id/status
userRouter.get('/:id/status', (req, res) => {
  const { id } = req.params;
  const user = db.users.find((u) => u.id === id);

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Foydalanuvchi topilmadi.',
      code: 'USER_NOT_FOUND',
    });
    return;
  }

  res.json({
    success: true,
    userId: user.id,
    username: user.username,
    status: user.status,
    lastSeen: user.lastSeen,
  });
});
