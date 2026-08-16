import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  passwordHash: string;
  avatarUrl: string;
  phone?: string;
  bio?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system' | 'data';
  mediaUrl?: string;
  fileDetails?: {
    name: string;
    size: number;
    mimeType: string;
  };
  dataPayload?: Record<string, any>;
  replyToMessageId?: string;
  reactions: { emoji: string; userId: string; username: string }[];
  readBy: { userId: string; readAt: string }[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'channel';
  title?: string;
  description?: string;
  avatarUrl?: string;
  creatorId: string;
  participantIds: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
  unreadCount?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface SharedData {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: 'report' | 'sensor_data' | 'feed_post' | 'file_share' | 'config' | 'announcement';
  title: string;
  description?: string;
  payload: Record<string, any>;
  tags: string[];
  visibility: 'public' | 'private' | 'restricted';
  likes: string[];
  downloadsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredFile {
  id: string;
  uploaderId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  ip: string;
  userAgent: string;
  userId?: string;
}

class InMemoryDatabase {
  users: User[] = [];
  chats: Chat[] = [];
  messages: Message[] = [];
  sharedData: SharedData[] = [];
  files: StoredFile[] = [];
  logs: RequestLog[] = [];
  serverStartedAt: string = new Date().toISOString();
  totalRequestsHandled: number = 0;

  constructor() {
    this.seed();
  }

  seed() {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('saburov2026', salt);

    // Initial users
    this.users = [
      {
        id: 'usr_saburov_01',
        username: 'jasur_saburov',
        email: 'jasur@saburov.uz',
        fullName: 'Jasur Saburov',
        passwordHash: defaultPasswordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        phone: '+998 90 123 45 67',
        bio: 'Lead Architect & Founder of api.saburov.uz ecosystem.',
        status: 'online',
        lastSeen: new Date().toISOString(),
        role: 'admin',
        createdAt: '2026-01-10T08:00:00.000Z',
      },
      {
        id: 'usr_malika_02',
        username: 'malika_ali',
        email: 'malika@saburov.uz',
        fullName: 'Malika Aliyeva',
        passwordHash: defaultPasswordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        phone: '+998 93 987 65 43',
        bio: 'Mobile Lead Engineer (Flutter & iOS Swift).',
        status: 'online',
        lastSeen: new Date().toISOString(),
        role: 'user',
        createdAt: '2026-01-15T09:30:00.000Z',
      },
      {
        id: 'usr_dilshod_03',
        username: 'dilshod_dev',
        email: 'dilshod@saburov.uz',
        fullName: 'Dilshod Karimov',
        passwordHash: defaultPasswordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        phone: '+998 97 555 44 33',
        bio: 'Android & Backend API developer.',
        status: 'away',
        lastSeen: new Date(Date.now() - 15 * 60000).toISOString(),
        role: 'user',
        createdAt: '2026-02-01T11:20:00.000Z',
      },
      {
        id: 'usr_aziza_04',
        username: 'aziza_data',
        email: 'aziza@saburov.uz',
        fullName: 'Aziza Rahimova',
        passwordHash: defaultPasswordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        phone: '+998 99 777 88 99',
        bio: 'Data Scientist and IoT telemetry coordinator.',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3 * 3600000).toISOString(),
        role: 'user',
        createdAt: '2026-02-10T14:00:00.000Z',
      },
    ];

    // Initial Chats
    this.chats = [
      {
        id: 'chat_group_main',
        type: 'group',
        title: 'Saburov Mobile & API Dev Core',
        description: 'Rasmiy dasturchilar guruhi va real-vaqt ma\'lumotlar almashinuvi kanali',
        avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        creatorId: 'usr_saburov_01',
        participantIds: ['usr_saburov_01', 'usr_malika_02', 'usr_dilshod_03', 'usr_aziza_04'],
        lastMessage: {
          text: 'Mobil ilova uchun yangi REST API endpointlari va Swagger hujjati tayyorlandi!',
          senderId: 'usr_saburov_01',
          senderName: 'Jasur Saburov',
          createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
        },
        unreadCount: {
          usr_malika_02: 0,
          usr_dilshod_03: 1,
          usr_aziza_04: 3,
        },
        createdAt: '2026-01-20T10:00:00.000Z',
        updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      },
      {
        id: 'chat_direct_jasur_malika',
        type: 'direct',
        creatorId: 'usr_saburov_01',
        participantIds: ['usr_saburov_01', 'usr_malika_02'],
        lastMessage: {
          text: 'Flutter ilovasida token refresh qilish mexanizmi qanday ishlayapti?',
          senderId: 'usr_malika_02',
          senderName: 'Malika Aliyeva',
          createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
        },
        unreadCount: {
          usr_saburov_01: 0,
          usr_malika_02: 0,
        },
        createdAt: '2026-01-25T12:30:00.000Z',
        updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
      },
    ];

    // Initial Messages
    this.messages = [
      {
        id: 'msg_001',
        chatId: 'chat_group_main',
        senderId: 'usr_saburov_01',
        senderName: 'Jasur Saburov',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Assalomu alaykum jamoa! api.saburov.uz platformasi uchun xabarlar va ma\'lumotlar almashish tizimi ishga tushdi.',
        type: 'text',
        reactions: [{ emoji: '👍', userId: 'usr_malika_02', username: 'malika_ali' }, { emoji: '🔥', userId: 'usr_dilshod_03', username: 'dilshod_dev' }],
        readBy: [
          { userId: 'usr_malika_02', readAt: new Date(Date.now() - 120 * 60000).toISOString() },
          { userId: 'usr_dilshod_03', readAt: new Date(Date.now() - 100 * 60000).toISOString() },
        ],
        isEdited: false,
        createdAt: new Date(Date.now() - 125 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 125 * 60000).toISOString(),
      },
      {
        id: 'msg_002',
        chatId: 'chat_group_main',
        senderId: 'usr_malika_02',
        senderName: 'Malika Aliyeva',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        text: 'Ajoyib! Swagger va Redoc dokumentatsiyasi orqali Flutter va Swift modellarini sinxronlashtirib olamiz.',
        type: 'text',
        reactions: [{ emoji: '❤️', userId: 'usr_saburov_01', username: 'jasur_saburov' }],
        readBy: [{ userId: 'usr_saburov_01', readAt: new Date(Date.now() - 60 * 60000).toISOString() }],
        isEdited: false,
        createdAt: new Date(Date.now() - 70 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 70 * 60000).toISOString(),
      },
      {
        id: 'msg_003',
        chatId: 'chat_group_main',
        senderId: 'usr_saburov_01',
        senderName: 'Jasur Saburov',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Mobil ilova uchun yangi REST API endpointlari va Swagger hujjati tayyorlandi!',
        type: 'text',
        reactions: [{ emoji: '🚀', userId: 'usr_dilshod_03', username: 'dilshod_dev' }],
        readBy: [],
        isEdited: false,
        createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      },
      {
        id: 'msg_004',
        chatId: 'chat_direct_jasur_malika',
        senderId: 'usr_saburov_01',
        senderName: 'Jasur Saburov',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Malika, yangi JWT auth arxitekturasini sinab ko\'rdingizmi?',
        type: 'text',
        reactions: [],
        readBy: [{ userId: 'usr_malika_02', readAt: new Date(Date.now() - 28 * 60000).toISOString() }],
        isEdited: false,
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: 'msg_005',
        chatId: 'chat_direct_jasur_malika',
        senderId: 'usr_malika_02',
        senderName: 'Malika Aliyeva',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        text: 'Flutter ilovasida token refresh qilish mexanizmi qanday ishlayapti?',
        type: 'text',
        reactions: [{ emoji: '👌', userId: 'usr_saburov_01', username: 'jasur_saburov' }],
        readBy: [],
        isEdited: false,
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
      },
    ];

    // Initial Shared Data Objects / Feeds
    this.sharedData = [
      {
        id: 'data_telemetry_2026',
        authorId: 'usr_aziza_04',
        authorName: 'Aziza Rahimova',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        category: 'sensor_data',
        title: 'Toshkent Sensor & Ekologiya Telemetriyasi',
        description: 'Havo sifati indeksi (AQI), namlik va harorat ma\'lumotlar to\'plami',
        payload: {
          location: 'Tashkent, Uzbekistan',
          aqi: 42,
          status: 'Good / Toza',
          temperatureC: 24.5,
          humidityPct: 48,
          timestamp: '2026-08-16T10:00:00Z',
          sensorsOnline: 14,
        },
        tags: ['iot', 'telemetry', 'aqi', 'tashkent', 'saburov-data'],
        visibility: 'public',
        likes: ['usr_saburov_01', 'usr_malika_02', 'usr_dilshod_03'],
        downloadsCount: 142,
        createdAt: '2026-08-14T09:00:00.000Z',
        updatedAt: '2026-08-14T09:00:00.000Z',
      },
      {
        id: 'data_mobile_sync_01',
        authorId: 'usr_saburov_01',
        authorName: 'Jasur Saburov',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        category: 'config',
        title: 'Mobil Ilova Sinxronizatsiya Konfiguratsiyasi',
        description: 'Saburov Mobile App uchun xabarlar kesh hajmi, timeoutlar va push bildirishnomalar sozlamalari',
        payload: {
          appVersion: '1.2.0-beta',
          minSupportedVersion: '1.0.0',
          heartbeatIntervalSeconds: 30,
          maxUploadSizeBytes: 10485760,
          features: {
            realtimeChat: true,
            dataSync: true,
            voiceNotes: true,
            endToEndEncryption: false,
          },
        },
        tags: ['config', 'mobile', 'sync', 'settings'],
        visibility: 'public',
        likes: ['usr_malika_02'],
        downloadsCount: 89,
        createdAt: '2026-08-15T11:20:00.000Z',
        updatedAt: '2026-08-15T11:20:00.000Z',
      },
      {
        id: 'data_feed_announcement',
        authorId: 'usr_saburov_01',
        authorName: 'Jasur Saburov',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        category: 'announcement',
        title: 'api.saburov.uz Yangi Imkoniyatlari E\'lon Qilindi',
        description: 'Endi foydalanuvchilar chat orqali nafaqat matn, balki tuzilmalashtirilgan JSON ma\'lumotlar obyektlarini ham almashishlari mumkin.',
        payload: {
          event: 'API v1.2 Launch',
          endpointsAdded: [
            '/api/v1/data/sync',
            '/api/v1/chats/:id/messages/react',
            '/api/v1/storage/upload',
          ],
          sdkReady: ['Flutter / Dart', 'Android Kotlin', 'iOS Swift', 'React Native'],
        },
        tags: ['release', 'announcement', 'api-v1.2'],
        visibility: 'public',
        likes: ['usr_malika_02', 'usr_dilshod_03', 'usr_aziza_04'],
        downloadsCount: 310,
        createdAt: '2026-08-16T08:30:00.000Z',
        updatedAt: '2026-08-16T08:30:00.000Z',
      },
    ];

    // Initial Stored Files
    this.files = [
      {
        id: 'file_spec_pdf',
        uploaderId: 'usr_saburov_01',
        filename: 'saburov_api_spec_v1.2.pdf',
        originalName: 'Saburov API Specification Architecture.pdf',
        mimeType: 'application/pdf',
        size: 1048576,
        url: 'https://api.saburov.uz/storage/saburov_api_spec_v1.2.pdf',
        createdAt: '2026-08-15T10:00:00.000Z',
      },
      {
        id: 'file_avatar_demo',
        uploaderId: 'usr_malika_02',
        filename: 'mobile_screenshot_flutter.png',
        originalName: 'Saburov Mobile Chat Screen.png',
        mimeType: 'image/png',
        size: 524288,
        url: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?w=800&auto=format&fit=crop&q=80',
        createdAt: '2026-08-16T09:15:00.000Z',
      },
    ];

    // Seed initial request logs
    this.logs = [
      {
        id: 'log_01',
        timestamp: new Date(Date.now() - 5000).toISOString(),
        method: 'GET',
        path: '/api/v1/health',
        status: 200,
        durationMs: 4,
        ip: '127.0.0.1',
        userAgent: 'SaburovMobileApp/1.2.0 (Flutter; iOS 19.4)',
      },
      {
        id: 'log_02',
        timestamp: new Date(Date.now() - 3500).toISOString(),
        method: 'POST',
        path: '/api/v1/auth/login',
        status: 200,
        durationMs: 38,
        ip: '84.54.120.45',
        userAgent: 'SaburovApp-Android/1.2.0 (Kotlin/Retrofit)',
        userId: 'usr_saburov_01',
      },
      {
        id: 'log_03',
        timestamp: new Date(Date.now() - 2000).toISOString(),
        method: 'GET',
        path: '/api/v1/chats',
        status: 200,
        durationMs: 12,
        ip: '84.54.120.45',
        userAgent: 'SaburovApp-Android/1.2.0 (Kotlin/Retrofit)',
        userId: 'usr_saburov_01',
      },
    ];
  }

  addLog(log: Omit<RequestLog, 'id'>) {
    this.totalRequestsHandled++;
    const newLog: RequestLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
  }

  reset() {
    this.seed();
  }
}

export const db = new InMemoryDatabase();
