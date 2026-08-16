import { Router } from 'express';
import { db, StoredFile } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../auth';

export const storageRouter = Router();

// POST /api/v1/storage/upload — File/media upload (Base64 payload support for Mobile)
storageRouter.post('/upload', authenticateToken, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { filename, mimeType = 'application/octet-stream', base64Data, size } = req.body;

  if (!filename) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'filename kiritilishi shart.',
      code: 'FILENAME_REQUIRED',
    });
    return;
  }

  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const estimatedSize = size || (base64Data ? Math.round((base64Data.length * 3) / 4) : 1024);

  // Generate public file url (if image or general file)
  const isImage = mimeType.startsWith('image/');
  const fileUrl = isImage && !base64Data?.startsWith('data:')
    ? `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80`
    : `https://api.saburov.uz/storage/files/${fileId}/${cleanFilename}`;

  const newFile: StoredFile = {
    id: fileId,
    uploaderId: currentUserId,
    filename: cleanFilename,
    originalName: filename,
    mimeType,
    size: estimatedSize,
    url: fileUrl,
    createdAt: new Date().toISOString(),
  };

  db.files.push(newFile);

  res.status(201).json({
    success: true,
    message: 'Fayl muvaffaqiyatli yuklandi',
    file: newFile,
  });
});

// GET /api/v1/storage/files — List uploaded files
storageRouter.get('/files', authenticateToken, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const userFiles = db.files.filter((f) => f.uploaderId === currentUserId || req.user!.role === 'admin');

  res.json({
    success: true,
    total: userFiles.length,
    files: userFiles,
  });
});
