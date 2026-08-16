import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, User } from '../db';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../auth';

export const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post('/register', (req, res) => {
  const { username, email, password, fullName, phone, bio, avatarUrl } = req.body;

  if (!username || !email || !password || !fullName) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'username, email, password va fullName maydonlari majburiy.',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  const existingUsername = db.users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (existingUsername) {
    res.status(400).json({
      success: false,
      error: 'Conflict',
      message: 'Bu username allaqachon ro\'yxatdan o\'tgan.',
      code: 'USERNAME_EXISTS',
    });
    return;
  }

  const existingEmail = db.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (existingEmail) {
    res.status(400).json({
      success: false,
      error: 'Conflict',
      message: 'Bu email allaqachon ro\'yxatdan o\'tgan.',
      code: 'EMAIL_EXISTS',
    });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    passwordHash,
    avatarUrl:
      avatarUrl ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
    phone: phone || '',
    bio: bio || 'api.saburov.uz foydalanuvchisi',
    status: 'online',
    lastSeen: new Date().toISOString(),
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  const { accessToken, expiresIn } = generateToken(newUser);

  // Return safe user without password
  const { passwordHash: _, ...safeUser } = newUser;

  res.status(201).json({
    success: true,
    message: 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz',
    token: accessToken,
    expiresIn,
    user: safeUser,
  });
});

// POST /api/v1/auth/login
authRouter.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'username (yoki email) va password kiritilishi shart.',
      code: 'INVALID_CREDENTIALS',
    });
    return;
  }

  const user = db.users.find(
    (u) =>
      u.username.toLowerCase() === username.trim().toLowerCase() ||
      u.email.toLowerCase() === username.trim().toLowerCase()
  );

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Foydalanuvchi nomi yoki parol noto\'g\'ri.',
      code: 'AUTH_FAILED',
    });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Foydalanuvchi nomi yoki parol noto\'g\'ri.',
      code: 'AUTH_FAILED',
    });
    return;
  }

  // Update status & last seen
  user.status = 'online';
  user.lastSeen = new Date().toISOString();

  const { accessToken, expiresIn } = generateToken(user);
  const { passwordHash: _, ...safeUser } = user;

  res.json({
    success: true,
    message: 'Tizimga muvaffaqiyatli kirildi',
    token: accessToken,
    expiresIn,
    user: safeUser,
  });
});

// GET /api/v1/auth/me
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { passwordHash: _, ...safeUser } = user;

  res.json({
    success: true,
    user: safeUser,
  });
});

// PATCH /api/v1/auth/me
authRouter.patch('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { fullName, bio, status, avatarUrl, phone } = req.body;

  if (fullName !== undefined) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
  if (status !== undefined && ['online', 'offline', 'away', 'busy'].includes(status)) {
    user.status = status;
  }
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (phone !== undefined) user.phone = phone;

  user.lastSeen = new Date().toISOString();

  const { passwordHash: _, ...safeUser } = user;

  res.json({
    success: true,
    message: 'Profil muvaffaqiyatli yangilandi',
    user: safeUser,
  });
});

// POST /api/v1/auth/refresh
authRouter.post('/refresh', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { accessToken, expiresIn } = generateToken(user);

  res.json({
    success: true,
    token: accessToken,
    expiresIn,
  });
});
