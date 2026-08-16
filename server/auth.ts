import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'saburov-api-secret-key-2026-uzbekistan-secure';
const JWT_EXPIRES_IN = '7d';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): { accessToken: string; expiresIn: string } {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { accessToken, expiresIn: JWT_EXPIRES_IN };
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Ushbu endpointdan foydalanish uchun Bearer token talab qilinadi. Header: Authorization: Bearer <token>',
      code: 'AUTH_TOKEN_MISSING',
    });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Token eskirgan yoki yaroqsiz. Qaytadan /api/v1/auth/login orqali yangi token oling.',
      code: 'AUTH_TOKEN_INVALID',
    });
    return;
  }

  const user = db.users.find((u) => u.id === decoded.id);
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'User Not Found',
      message: 'Token egasi bo\'lgan foydalanuvchi topilmadi.',
      code: 'USER_NOT_FOUND',
    });
    return;
  }

  req.user = user;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.id) {
      const user = db.users.find((u) => u.id === decoded.id);
      if (user) {
        req.user = user;
      }
    }
  }
  next();
}
