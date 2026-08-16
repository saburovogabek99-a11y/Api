import { Router } from 'express';
import { db } from '../db';
import { openApiSpec } from '../openapi';

export const systemRouter = Router();

// GET /api/v1/health
systemRouter.get('/health', (req, res) => {
  const uptimeSeconds = (Date.now() - new Date(db.serverStartedAt).getTime()) / 1000;

  res.json({
    status: 'healthy',
    service: 'api.saburov.uz',
    version: '1.2.0',
    protocol: 'REST / JSON + WebSocket ready',
    uptimeSeconds: Math.round(uptimeSeconds),
    timestamp: new Date().toISOString(),
    database: {
      status: 'connected',
      engine: 'In-Memory State Engine with Persistence',
      usersCount: db.users.length,
      chatsCount: db.chats.length,
      messagesCount: db.messages.length,
      dataObjectsCount: db.sharedData.length,
    },
    system: {
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
    },
  });
});

// GET /api/v1/stats
systemRouter.get('/stats', (req, res) => {
  res.json({
    success: true,
    totalUsers: db.users.length,
    onlineUsers: db.users.filter((u) => u.status === 'online').length,
    totalChats: db.chats.length,
    totalMessages: db.messages.length,
    totalSharedData: db.sharedData.length,
    totalFiles: db.files.length,
    totalRequestsHandled: db.totalRequestsHandled,
    serverStartedAt: db.serverStartedAt,
  });
});

// GET /api/v1/logs
systemRouter.get('/logs', (req, res) => {
  res.json({
    success: true,
    total: db.logs.length,
    logs: db.logs.slice(0, 50),
  });
});

// GET /api/v1/openapi.json
systemRouter.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(openApiSpec);
});

// POST /api/v1/reset-demo
systemRouter.post('/reset-demo', (req, res) => {
  db.reset();
  res.json({
    success: true,
    message: 'Demo ma\'lumotlar bazasi qayta ishga tushirildi (re-seeded).',
  });
});
