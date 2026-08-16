import { Router } from 'express';
import { db, SharedData } from '../db';
import { authenticateToken, AuthenticatedRequest, optionalAuth } from '../auth';

export const dataRouter = Router();

// GET /api/v1/data/feed — Get public and community data objects
dataRouter.get('/feed', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { category, tag, search, limit = 20, page = 1 } = req.query;

  let list = db.sharedData.filter((item) => {
    if (item.visibility === 'public') return true;
    if (req.user && (item.authorId === req.user.id || req.user.role === 'admin')) return true;
    return false;
  });

  if (category && typeof category === 'string') {
    list = list.filter((item) => item.category === category);
  }

  if (tag && typeof tag === 'string') {
    list = list.filter((item) => item.tags.includes(tag.toLowerCase()));
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(s) ||
        (item.description && item.description.toLowerCase().includes(s)) ||
        item.authorName.toLowerCase().includes(s)
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pageNum = Math.max(1, parseInt(String(page)) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 20));
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = list.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    total: list.length,
    page: pageNum,
    limit: limitNum,
    data: paginated,
  });
});

// POST /api/v1/data/publish — Publish new data payload
dataRouter.post('/publish', authenticateToken, (req: AuthenticatedRequest, res) => {
  const currentUser = req.user!;
  const {
    category = 'feed_post',
    title,
    description,
    payload,
    tags = [],
    visibility = 'public',
  } = req.body;

  if (!title || !payload || typeof payload !== 'object') {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'title va payload (JSON object) kiritilishi shart.',
      code: 'INVALID_PAYLOAD',
    });
    return;
  }

  const now = new Date().toISOString();
  const newItem: SharedData = {
    id: `data_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    authorId: currentUser.id,
    authorName: currentUser.fullName,
    authorAvatar: currentUser.avatarUrl,
    category,
    title: title.trim(),
    description: description ? description.trim() : '',
    payload,
    tags: Array.isArray(tags) ? tags.map((t: string) => String(t).toLowerCase()) : [],
    visibility,
    likes: [],
    downloadsCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.sharedData.unshift(newItem);

  res.status(201).json({
    success: true,
    message: 'Ma\'lumotlar paketi muvaffaqiyatli chop etildi',
    data: newItem,
  });
});

// GET /api/v1/data/:dataId — Single data item
dataRouter.get('/:dataId', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { dataId } = req.params;
  const item = db.sharedData.find((d) => d.id === dataId);

  if (!item) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Ma\'lumot obyekti topilmadi.',
    });
    return;
  }

  item.downloadsCount++;

  res.json({
    success: true,
    data: item,
  });
});

// POST /api/v1/data/:dataId/like
dataRouter.post('/:dataId/like', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { dataId } = req.params;
  const currentUserId = req.user!.id;

  const item = db.sharedData.find((d) => d.id === dataId);
  if (!item) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Ma\'lumot obyekti topilmadi.',
    });
    return;
  }

  const likeIdx = item.likes.indexOf(currentUserId);
  let isLiked = false;
  if (likeIdx > -1) {
    item.likes.splice(likeIdx, 1);
    isLiked = false;
  } else {
    item.likes.push(currentUserId);
    isLiked = true;
  }

  res.json({
    success: true,
    liked: isLiked,
    totalLikes: item.likes.length,
  });
});

// POST /api/v1/data/sync — Mobile offline data synchronization endpoint
dataRouter.post('/sync', authenticateToken, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { lastSyncTimestamp, clientDevice, clientChanges } = req.body;

  const syncDate = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0);
  const now = new Date().toISOString();

  // Find newer messages in user's chats
  const userChatIds = db.chats
    .filter((c) => c.participantIds.includes(currentUserId))
    .map((c) => c.id);

  const deltaMessages = db.messages.filter(
    (m) => userChatIds.includes(m.chatId) && new Date(m.createdAt) > syncDate
  );

  const deltaData = db.sharedData.filter(
    (d) => new Date(d.createdAt) > syncDate
  );

  res.json({
    success: true,
    message: 'Oflayn sinxronizatsiya muvaffaqiyatli bajarildi',
    syncedAt: now,
    clientDevice: clientDevice || 'Mobile App',
    newMessagesCount: deltaMessages.length,
    newFeedItemsCount: deltaData.length,
    delta: {
      messages: deltaMessages,
      sharedData: deltaData,
      serverTime: now,
    },
  });
});
