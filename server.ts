import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { authRouter } from './server/routes/authRoutes';
import { userRouter } from './server/routes/userRoutes';
import { chatRouter, messageRouter } from './server/routes/chatRoutes';
import { dataRouter } from './server/routes/dataRoutes';
import { storageRouter } from './server/routes/storageRoutes';
import { systemRouter } from './server/routes/systemRoutes';
import { openApiSpec } from './server/openapi';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic middlewares
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  }));

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Request logger middleware
  app.use((req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function (body) {
      const durationMs = Date.now() - startTime;
      if (req.path.startsWith('/api/')) {
        db.addLog({
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs,
          ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
          userAgent: req.get('user-agent') || 'Unknown',
        });
      }
      return originalSend.call(this, body);
    };

    next();
  });

  // Mount API v1 Routes
  const apiRouter = express.Router();

  apiRouter.use('/auth', authRouter);
  apiRouter.use('/users', userRouter);
  apiRouter.use('/chats', chatRouter);
  apiRouter.use('/messages', messageRouter);
  apiRouter.use('/data', dataRouter);
  apiRouter.use('/storage', storageRouter);
  apiRouter.use('/', systemRouter);

  // Mount on /api/v1 and alias on /api
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // Direct Swagger JSON / YAML endpoints
  app.get('/openapi.json', (req, res) => {
    res.json(openApiSpec);
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message || 'Kutilmagan server xatoligi yuz berdi.',
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[api.saburov.uz] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[api.saburov.uz] API v1 base: http://0.0.0.0:${PORT}/api/v1`);
    console.log(`[api.saburov.uz] OpenAPI Spec: http://0.0.0.0:${PORT}/api/v1/openapi.json`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
