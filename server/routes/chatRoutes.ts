import { Router } from 'express';
import { db, Chat, Message } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../auth';

export const chatRouter = Router();

// GET /api/v1/chats — List current user's chats
chatRouter.get('/', authenticateToken, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;

  const userChats = db.chats
    .filter((c) => c.participantIds.includes(currentUserId))
    .map((chat) => {
      // Enrich with participants details
      const participants = chat.participantIds.map((pid) => {
        const u = db.users.find((user) => user.id === pid);
        return u
          ? {
              id: u.id,
              username: u.username,
              fullName: u.fullName,
              avatarUrl: u.avatarUrl,
              status: u.status,
            }
          : { id: pid };
      });

      return {
        ...chat,
        participants,
      };
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  res.json({
    success: true,
    total: userChats.length,
    chats: userChats,
  });
});

// POST /api/v1/chats — Create new direct or group chat
chatRouter.post('/', authenticateToken, (req: AuthenticatedRequest, res) => {
  const currentUserId = req.user!.id;
  const { type = 'direct', title, description, participantIds = [], avatarUrl } = req.body;

  if (!Array.isArray(participantIds)) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'participantIds massiv bo\'lishi shart.',
      code: 'INVALID_PARTICIPANTS',
    });
    return;
  }

  // Ensure current user is in participants
  const allParticipantIds = Array.from(new Set([currentUserId, ...participantIds]));

  if (type === 'direct' && allParticipantIds.length === 2) {
    // Check if direct chat already exists
    const existing = db.chats.find(
      (c) =>
        c.type === 'direct' &&
        c.participantIds.length === 2 &&
        c.participantIds.includes(allParticipantIds[0]) &&
        c.participantIds.includes(allParticipantIds[1])
    );
    if (existing) {
      res.json({
        success: true,
        message: 'Mavjud chat qaytarildi',
        chat: existing,
      });
      return;
    }
  }

  const otherUser =
    type === 'direct'
      ? db.users.find((u) => u.id === allParticipantIds.find((id) => id !== currentUserId))
      : null;

  const newChat: Chat = {
    id: `chat_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    title:
      title ||
      (type === 'direct'
        ? otherUser
          ? otherUser.fullName
          : 'Suhbat'
        : 'Yangi Guruh'),
    description: description || '',
    avatarUrl:
      avatarUrl ||
      (otherUser
        ? otherUser.avatarUrl
        : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'),
    creatorId: currentUserId,
    participantIds: allParticipantIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadCount: {},
  };

  db.chats.unshift(newChat);

  res.status(201).json({
    success: true,
    message: 'Chat muvaffaqiyatli yaratildi',
    chat: newChat,
  });
});

// GET /api/v1/chats/:chatId — Get single chat info
chatRouter.get('/:chatId', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { chatId } = req.params;
  const currentUserId = req.user!.id;

  const chat = db.chats.find((c) => c.id === chatId);
  if (!chat) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Chat topilmadi.',
      code: 'CHAT_NOT_FOUND',
    });
    return;
  }

  if (!chat.participantIds.includes(currentUserId)) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Siz ushbu chat a\'zosi emassiz.',
      code: 'ACCESS_DENIED',
    });
    return;
  }

  const participants = chat.participantIds.map((pid) => {
    const u = db.users.find((user) => user.id === pid);
    return u
      ? {
          id: u.id,
          username: u.username,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          status: u.status,
          bio: u.bio,
        }
      : { id: pid };
  });

  res.json({
    success: true,
    chat: {
      ...chat,
      participants,
    },
  });
});

// GET /api/v1/chats/:chatId/messages — Get messages in chat
chatRouter.get('/:chatId/messages', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { chatId } = req.params;
  const { limit = 50, search } = req.query;
  const currentUserId = req.user!.id;

  const chat = db.chats.find((c) => c.id === chatId);
  if (!chat) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Chat topilmadi.',
      code: 'CHAT_NOT_FOUND',
    });
    return;
  }

  if (!chat.participantIds.includes(currentUserId)) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Siz ushbu chat a\'zosi emassiz.',
      code: 'ACCESS_DENIED',
    });
    return;
  }

  let chatMessages = db.messages.filter((m) => m.chatId === chatId);

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    chatMessages = chatMessages.filter((m) => m.text.toLowerCase().includes(s));
  }

  // Sort chronological
  chatMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 50));
  const result = chatMessages.slice(-limitNum);

  res.json({
    success: true,
    chatId,
    total: chatMessages.length,
    messages: result,
  });
});

// POST /api/v1/chats/:chatId/messages — Send message or data object
chatRouter.post('/:chatId/messages', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { chatId } = req.params;
  const currentUserId = req.user!.id;
  const currentUser = req.user!;
  const {
    text = '',
    type = 'text',
    mediaUrl,
    fileDetails,
    dataPayload,
    replyToMessageId,
  } = req.body;

  const chat = db.chats.find((c) => c.id === chatId);
  if (!chat) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Chat topilmadi.',
      code: 'CHAT_NOT_FOUND',
    });
    return;
  }

  if (!chat.participantIds.includes(currentUserId)) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Siz ushbu chat a\'zosi emassiz.',
      code: 'ACCESS_DENIED',
    });
    return;
  }

  if (!text.trim() && !mediaUrl && !dataPayload) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Xabar matni, media yoki dataPayload kiritilishi shart.',
      code: 'EMPTY_MESSAGE',
    });
    return;
  }

  const now = new Date().toISOString();
  const newMessage: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    chatId,
    senderId: currentUserId,
    senderName: currentUser.fullName,
    senderAvatar: currentUser.avatarUrl,
    text: text.trim(),
    type,
    mediaUrl,
    fileDetails,
    dataPayload,
    replyToMessageId,
    reactions: [],
    readBy: [{ userId: currentUserId, readAt: now }],
    isEdited: false,
    createdAt: now,
    updatedAt: now,
  };

  db.messages.push(newMessage);

  // Update chat last message & timestamp
  chat.lastMessage = {
    text: text.trim() || (type === 'data' ? '[Ma\'lumotlar paketi]' : '[Media xabar]'),
    senderId: currentUserId,
    senderName: currentUser.fullName,
    createdAt: now,
  };
  chat.updatedAt = now;

  res.status(201).json({
    success: true,
    message: newMessage,
  });
});

export const messageRouter = Router();

// POST /api/v1/messages/:messageId/react
messageRouter.post('/:messageId/react', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { messageId } = req.params;
  const currentUserId = req.user!.id;
  const currentUser = req.user!;
  const { emoji } = req.body;

  if (!emoji) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'emoji ko\'rsatilishi shart (masalan: 👍, ❤️, 🔥, 🚀).',
    });
    return;
  }

  const msg = db.messages.find((m) => m.id === messageId);
  if (!msg) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Xabar topilmadi.',
    });
    return;
  }

  const existingIndex = msg.reactions.findIndex(
    (r) => r.userId === currentUserId && r.emoji === emoji
  );

  if (existingIndex > -1) {
    // Toggle off
    msg.reactions.splice(existingIndex, 1);
  } else {
    // Add reaction
    msg.reactions.push({
      emoji,
      userId: currentUserId,
      username: currentUser.username,
    });
  }

  res.json({
    success: true,
    messageId,
    reactions: msg.reactions,
  });
});

// POST /api/v1/messages/:messageId/read
messageRouter.post('/:messageId/read', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { messageId } = req.params;
  const currentUserId = req.user!.id;

  const msg = db.messages.find((m) => m.id === messageId);
  if (!msg) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Xabar topilmadi.',
    });
    return;
  }

  const now = new Date().toISOString();
  if (!msg.readBy.some((r) => r.userId === currentUserId)) {
    msg.readBy.push({ userId: currentUserId, readAt: now });
  }

  res.json({
    success: true,
    messageId,
    readAt: now,
  });
});

// DELETE /api/v1/messages/:messageId
messageRouter.delete('/:messageId', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { messageId } = req.params;
  const currentUserId = req.user!.id;

  const index = db.messages.findIndex((m) => m.id === messageId);
  if (index === -1) {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Xabar topilmadi.',
    });
    return;
  }

  const msg = db.messages[index];
  if (msg.senderId !== currentUserId && req.user!.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Faqat o\'z xabaringizni o\'chira olasiz.',
    });
    return;
  }

  db.messages.splice(index, 1);

  res.json({
    success: true,
    message: 'Xabar muvaffaqiyatli o\'chirildi',
    deletedMessageId: messageId,
  });
});
