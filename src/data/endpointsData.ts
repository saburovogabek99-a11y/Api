import { ApiEndpoint, ApiTag } from '../types/api';

export const API_TAGS: ApiTag[] = [
  { name: 'Auth', description: 'Foydalanuvchilarni ro\'yxatdan o\'tkazish, tizimga kirish va JWT token boshqaruvi' },
  { name: 'Users', description: 'Foydalanuvchilarni qidirish, profillarni ko\'rish va onlayn status' },
  { name: 'Chats', description: 'Yakkama-yakka va guruh chatlarini yaratish va ro\'yxatini olish' },
  { name: 'Messages', description: 'Chatlarga xabarlar, rasm, media va data-paketlar yuborish' },
  { name: 'Data Exchange', description: 'Strukturalashgan ma\'lumotlar almashish, IoT telemetriya va oflayn sinxronizatsiya' },
  { name: 'Storage', description: 'Fayllar, medialar va hujjatlarni serverga yuklash' },
  { name: 'System', description: 'API holati, diagnostika, statistika va OpenAPI spetsifikatsiyasi' },
];

export const API_ENDPOINTS: ApiEndpoint[] = [
  // AUTH
  {
    id: 'auth-register',
    path: '/api/v1/auth/register',
    method: 'POST',
    tags: ['Auth'],
    summary: 'Yangi foydalanuvchini ro\'yxatdan o\'tkazish',
    description: 'Yangi akkaunt yaratadi va darhol JWT Bearer tokenni qaytaradi.',
    requiresAuth: false,
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          username: { type: 'string', description: 'Noyob foydalanuvchi nomi' },
          email: { type: 'string', description: 'Elektron pochta manzili' },
          password: { type: 'string', description: 'Kamida 6 belgili maxfiy parol' },
          fullName: { type: 'string', description: 'Foydalanuvchining to\'liq ismi' },
          phone: { type: 'string', description: 'Telefon raqam' },
          bio: { type: 'string', description: 'Qisqacha ma\'lumot' },
        },
      },
      example: {
        username: 'anvar_dev',
        email: 'anvar@saburov.uz',
        password: 'password2026',
        fullName: 'Anvar Zokirov',
        phone: '+998 90 555 11 22',
        bio: 'Mobile & Backend engineer',
      },
    },
    responses: [
      {
        status: 201,
        description: 'Muvaffaqiyatli ro\'yxatdan o\'tildi',
        example: {
          success: true,
          message: "Ro'yxatdan muvaffaqiyatli o'tdingiz",
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: '7d',
          user: {
            id: 'usr_1739700000',
            username: 'anvar_dev',
            email: 'anvar@saburov.uz',
            fullName: 'Anvar Zokirov',
            status: 'online',
            role: 'user',
          },
        },
      },
      {
        status: 400,
        description: 'Username yoki Email allaqachon band',
        example: {
          success: false,
          error: 'Conflict',
          message: "Bu username allaqachon ro'yxatdan o'tgan.",
          code: 'USERNAME_EXISTS',
        },
      },
    ],
  },
  {
    id: 'auth-login',
    path: '/api/v1/auth/login',
    method: 'POST',
    tags: ['Auth'],
    summary: 'Tizimga kirish (JWT token olish)',
    description: 'Username yoki email hamda parol orqali tizimga kirib, 7 kunlik JWT token olinadi.',
    requiresAuth: false,
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          username: { type: 'string', description: 'Foydalanuvchi nomi yoki email' },
          password: { type: 'string', description: 'Parol' },
        },
      },
      example: {
        username: 'jasur_saburov',
        password: 'saburov2026',
      },
    },
    responses: [
      {
        status: 200,
        description: 'Muvaffaqiyatli kirildi',
        example: {
          success: true,
          message: 'Tizimga muvaffaqiyatli kirildi',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: '7d',
          user: {
            id: 'usr_saburov_01',
            username: 'jasur_saburov',
            email: 'jasur@saburov.uz',
            fullName: 'Jasur Saburov',
            status: 'online',
            role: 'admin',
          },
        },
      },
      {
        status: 401,
        description: 'Login yoki parol noto\'g\'ri',
        example: {
          success: false,
          error: 'Unauthorized',
          message: "Foydalanuvchi nomi yoki parol noto'g'ri.",
        },
      },
    ],
  },
  {
    id: 'auth-me',
    path: '/api/v1/auth/me',
    method: 'GET',
    tags: ['Auth'],
    summary: 'Joriy foydalanuvchi ma\'lumotlarini olish',
    description: 'Bearer token orqali kirgan foydalanuvchi profilini qaytaradi.',
    requiresAuth: true,
    responses: [
      {
        status: 200,
        description: 'Joriy foydalanuvchi profili',
        example: {
          success: true,
          user: {
            id: 'usr_saburov_01',
            username: 'jasur_saburov',
            email: 'jasur@saburov.uz',
            fullName: 'Jasur Saburov',
            status: 'online',
            bio: 'Lead Architect & Founder of api.saburov.uz',
            role: 'admin',
          },
        },
      },
      {
        status: 401,
        description: 'Token mavjud emas yoki eskirgan',
        example: {
          success: false,
          error: 'Unauthorized',
          message: 'Bearer token talab qilinadi.',
        },
      },
    ],
  },
  {
    id: 'auth-update-me',
    path: '/api/v1/auth/me',
    method: 'PATCH',
    tags: ['Auth'],
    summary: 'Profil ma\'lumotlarini va holatni yangilash',
    description: 'Ism, bio, status (online/offline/away/busy) yoki avatarni yangilash.',
    requiresAuth: true,
    requestBody: {
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          fullName: { type: 'string' },
          bio: { type: 'string' },
          status: { type: 'string', enum: ['online', 'offline', 'away', 'busy'] },
          phone: { type: 'string' },
        },
      },
      example: {
        fullName: 'Jasur Saburov',
        bio: 'Senior Cloud & Mobile Architect',
        status: 'online',
      },
    },
    responses: [
      {
        status: 200,
        description: 'Profil yangilandi',
        example: {
          success: true,
          message: 'Profil muvaffaqiyatli yangilandi',
          user: {
            id: 'usr_saburov_01',
            fullName: 'Jasur Saburov',
            bio: 'Senior Cloud & Mobile Architect',
            status: 'online',
          },
        },
      },
    ],
  },

  // USERS
  {
    id: 'users-list',
    path: '/api/v1/users',
    method: 'GET',
    tags: ['Users'],
    summary: 'Foydalanuvchilarni qidirish va ro\'yxatini olish',
    description: 'Foydalanuvchilar bazasidan ism, username yoki status bo\'yicha qidirish.',
    requiresAuth: false,
    parameters: [
      { name: 'search', in: 'query', type: 'string', description: 'Qidiruv so\'zi' },
      { name: 'status', in: 'query', type: 'string', description: 'online, offline, away, busy' },
      { name: 'limit', in: 'query', type: 'integer', default: 20 },
      { name: 'page', in: 'query', type: 'integer', default: 1 },
    ],
    responses: [
      {
        status: 200,
        description: 'Foydalanuvchilar ro\'yxati',
        example: {
          success: true,
          total: 4,
          page: 1,
          limit: 20,
          users: [
            {
              id: 'usr_saburov_01',
              username: 'jasur_saburov',
              fullName: 'Jasur Saburov',
              status: 'online',
            },
            {
              id: 'usr_malika_02',
              username: 'malika_ali',
              fullName: 'Malika Aliyeva',
              status: 'online',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'users-get-one',
    path: '/api/v1/users/usr_saburov_01',
    method: 'GET',
    tags: ['Users'],
    summary: 'Bitta foydalanuvchi profilini olish',
    description: 'ID yoki username bo\'yicha to\'liq ochiq profil ma\'lumotlarini olish.',
    requiresAuth: false,
    parameters: [
      { name: 'id', in: 'path', required: true, type: 'string', example: 'usr_saburov_01' },
    ],
    responses: [
      {
        status: 200,
        description: 'Foydalanuvchi topildi',
        example: {
          success: true,
          user: {
            id: 'usr_saburov_01',
            username: 'jasur_saburov',
            fullName: 'Jasur Saburov',
            status: 'online',
            bio: 'Lead Architect & Founder of api.saburov.uz',
          },
        },
      },
    ],
  },

  // CHATS
  {
    id: 'chats-list',
    path: '/api/v1/chats',
    method: 'GET',
    tags: ['Chats'],
    summary: 'Mening barcha chatlarim ro\'yxati',
    description: 'Joriy foydalanuvchi a\'zo bo\'lgan barcha shaxsiy va guruh suhbatlarini, oxirgi xabar va ishtirokchilar bilan birga oladi.',
    requiresAuth: true,
    responses: [
      {
        status: 200,
        description: 'Chatlar ro\'yxati',
        example: {
          success: true,
          total: 2,
          chats: [
            {
              id: 'chat_group_main',
              type: 'group',
              title: 'Saburov Mobile & API Dev Core',
              lastMessage: {
                text: 'Mobil ilova uchun yangi REST API endpointlari va Swagger hujjati tayyorlandi!',
                senderName: 'Jasur Saburov',
              },
            },
          ],
        },
      },
    ],
  },
  {
    id: 'chats-create',
    path: '/api/v1/chats',
    method: 'POST',
    tags: ['Chats'],
    summary: 'Yangi chat yoki guruh yaratish',
    description: 'Boshqa foydalanuvchi bilan shaxsiy chat ochish yoki ko\'p kishilik guruh yaratish.',
    requiresAuth: true,
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['direct', 'group', 'channel'], default: 'direct' },
          title: { type: 'string', description: 'Guruh nomi (faqat guruh uchun)' },
          description: { type: 'string' },
          participantIds: { type: 'array', items: { type: 'string' } },
        },
      },
      example: {
        type: 'direct',
        participantIds: ['usr_malika_02'],
      },
    },
    responses: [
      {
        status: 201,
        description: 'Chat yaratildi',
        example: {
          success: true,
          message: 'Chat muvaffaqiyatli yaratildi',
          chat: {
            id: 'chat_direct_123',
            type: 'direct',
            participantIds: ['usr_saburov_01', 'usr_malika_02'],
          },
        },
      },
    ],
  },

  // MESSAGES
  {
    id: 'messages-list',
    path: '/api/v1/chats/chat_group_main/messages',
    method: 'GET',
    tags: ['Messages'],
    summary: 'Chatdagi barcha xabarlarni olish',
    description: 'Ko\'rsatilgan chatdagi xabarlar tarixini saralangan holda oladi.',
    requiresAuth: true,
    parameters: [
      { name: 'chatId', in: 'path', required: true, type: 'string', example: 'chat_group_main' },
      { name: 'limit', in: 'query', type: 'integer', default: 50 },
      { name: 'search', in: 'query', type: 'string' },
    ],
    responses: [
      {
        status: 200,
        description: 'Xabarlar ro\'yxati',
        example: {
          success: true,
          chatId: 'chat_group_main',
          total: 3,
          messages: [
            {
              id: 'msg_001',
              senderName: 'Jasur Saburov',
              text: 'Assalomu alaykum jamoa! api.saburov.uz ishga tushdi.',
              type: 'text',
              reactions: [{ emoji: '👍', username: 'malika_ali' }],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'messages-send',
    path: '/api/v1/chats/chat_group_main/messages',
    method: 'POST',
    tags: ['Messages'],
    summary: 'Chatga xabar yoki ma\'lumot paketi yuborish',
    description: 'Chatga matn, media URL yoki to\'g\'ridan-to\'g\'ri strukturalangan dataPayload yuborish.',
    requiresAuth: true,
    parameters: [
      { name: 'chatId', in: 'path', required: true, type: 'string', example: 'chat_group_main' },
    ],
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Xabar matni' },
          type: { type: 'string', enum: ['text', 'image', 'file', 'data'], default: 'text' },
          mediaUrl: { type: 'string' },
          dataPayload: { type: 'object', description: 'Ixtiyoriy JSON ma\'lumotlar paketi' },
        },
      },
      example: {
        text: 'Mobil ilovada yangi versiya test qilindi, barcha parametrlar barqaror!',
        type: 'text',
        dataPayload: {
          version: '1.2.0-rc',
          testedPlatform: 'Flutter iOS / Android',
          status: 'PASSED',
        },
      },
    },
    responses: [
      {
        status: 201,
        description: 'Xabar jo\'natildi',
        example: {
          success: true,
          message: {
            id: 'msg_17397000',
            chatId: 'chat_group_main',
            text: 'Mobil ilovada yangi versiya test qilindi...',
            type: 'text',
            createdAt: '2026-08-16T10:30:00.000Z',
          },
        },
      },
    ],
  },
  {
    id: 'messages-react',
    path: '/api/v1/messages/msg_001/react',
    method: 'POST',
    tags: ['Messages'],
    summary: 'Xabarga reaksiya (emoji) bildirish',
    description: 'Xabarga 👍, ❤️, 🔥, 🚀 kabi emojilar qoldirish yoki bekor qilish.',
    requiresAuth: true,
    parameters: [
      { name: 'messageId', in: 'path', required: true, type: 'string', example: 'msg_001' },
    ],
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          emoji: { type: 'string', example: '🔥' },
        },
      },
      example: {
        emoji: '🚀',
      },
    },
    responses: [
      {
        status: 200,
        description: 'Reaksiya holati yangilandi',
        example: {
          success: true,
          messageId: 'msg_001',
          reactions: [
            { emoji: '👍', username: 'malika_ali' },
            { emoji: '🚀', username: 'jasur_saburov' },
          ],
        },
      },
    ],
  },

  // DATA EXCHANGE
  {
    id: 'data-feed',
    path: '/api/v1/data/feed',
    method: 'GET',
    tags: ['Data Exchange'],
    summary: 'Ulashilgan ma\'lumotlar tasmachasi (Data Feed)',
    description: 'Foydalanuvchilar va qurilmalar tomonidan ulashilgan ochiq JSON ma\'lumotlar, telemetriya va e\'lonlarni olish.',
    requiresAuth: false,
    parameters: [
      { name: 'category', in: 'query', type: 'string', description: 'sensor_data, report, config, announcement' },
      { name: 'tag', in: 'query', type: 'string', description: 'Teg bo\'yicha filter' },
      { name: 'search', in: 'query', type: 'string', description: 'Qidiruv' },
    ],
    responses: [
      {
        status: 200,
        description: 'Ma\'lumotlar to\'plami',
        example: {
          success: true,
          total: 3,
          data: [
            {
              id: 'data_telemetry_2026',
              category: 'sensor_data',
              title: 'Toshkent Sensor & Ekologiya Telemetriyasi',
              payload: {
                location: 'Tashkent, Uzbekistan',
                aqi: 42,
                temperatureC: 24.5,
                humidityPct: 48,
              },
              tags: ['iot', 'telemetry', 'aqi'],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'data-publish',
    path: '/api/v1/data/publish',
    method: 'POST',
    tags: ['Data Exchange'],
    summary: 'Yangi ma\'lumotlar obyekti nashr etish',
    description: 'Ochiq yoki yopiq ko\'rinishda tizimga yangi JSON ma\'lumotlar paketi yuklash.',
    requiresAuth: true,
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['sensor_data', 'report', 'feed_post', 'config', 'announcement'] },
          title: { type: 'string' },
          description: { type: 'string' },
          payload: { type: 'object' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      example: {
        category: 'sensor_data',
        title: 'Buxoro Quyosh Stansiyasi Ishlab Chiqarish Quvvati',
        description: 'Bugungi quyosh batareyalari generatsiya ko\'rsatkichi',
        payload: {
          city: 'Bukhara',
          currentOutputKw: 4850,
          peakEfficiencyPct: 94.2,
          solarRadiation: 890,
        },
        tags: ['solar', 'energy', 'bukhara', 'iot'],
      },
    },
    responses: [
      {
        status: 201,
        description: 'Ma\'lumot saqlandi',
        example: {
          success: true,
          message: "Ma'lumotlar paketi muvaffaqiyatli chop etildi",
          data: {
            id: 'data_17397000',
            title: 'Buxoro Quyosh Stansiyasi...',
          },
        },
      },
    ],
  },
  {
    id: 'data-sync',
    path: '/api/v1/data/sync',
    method: 'POST',
    tags: ['Data Exchange'],
    summary: 'Mobil ilovalar uchun oflayn kesh sinxronizatsiyasi',
    description: 'Mobil ilova tarmoqqa qayta ulanganda, oxirgi sinxronizatsiya vaqtidan keyin kelgan yangi xabarlar va o\'zgarishlar deltasini yuklab oladi.',
    requiresAuth: true,
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          lastSyncTimestamp: { type: 'string', description: 'Oxirgi sync vaqti (ISO 8601)' },
          clientDevice: { type: 'string', description: 'Qurilma modeli va OS' },
        },
      },
      example: {
        lastSyncTimestamp: '2026-08-16T00:00:00.000Z',
        clientDevice: 'SaburovApp-Flutter/1.2.0 (iOS 19.4)',
      },
    },
    responses: [
      {
        status: 200,
        description: 'O\'zgarishlar deltasini qaytaradi',
        example: {
          success: true,
          message: 'Oflayn sinxronizatsiya muvaffaqiyatli bajarildi',
          syncedAt: '2026-08-16T10:30:00.000Z',
          newMessagesCount: 5,
          newFeedItemsCount: 2,
          delta: {
            messages: [],
            sharedData: [],
          },
        },
      },
    ],
  },

  // STORAGE
  {
    id: 'storage-upload',
    path: '/api/v1/storage/upload',
    method: 'POST',
    tags: ['Storage'],
    summary: 'Fayl yoki media yuklash (Base64)',
    description: 'Mobil ilovalar va vebdan rasmlar, audio va hujjatlarni serverga yuklash.',
    requiresAuth: true,
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          filename: { type: 'string' },
          mimeType: { type: 'string' },
          base64Data: { type: 'string' },
        },
      },
      example: {
        filename: 'my_avatar.png',
        mimeType: 'image/png',
        base64Data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      },
    },
    responses: [
      {
        status: 201,
        description: 'Fayl yuklandi',
        example: {
          success: true,
          file: {
            id: 'file_17397000',
            filename: 'my_avatar.png',
            url: 'https://api.saburov.uz/storage/files/file_17397000/my_avatar.png',
            size: 1024,
          },
        },
      },
    ],
  },

  // SYSTEM
  {
    id: 'system-health',
    path: '/api/v1/health',
    method: 'GET',
    tags: ['System'],
    summary: 'API holati va sog\'lomlik tekshiruvi (Health Check)',
    description: 'Server ishlayotgani, uptime, xotira hajmi va baza ulanishini tekshirish.',
    requiresAuth: false,
    responses: [
      {
        status: 200,
        description: 'Server faol',
        example: {
          status: 'healthy',
          service: 'api.saburov.uz',
          version: '1.2.0',
          uptimeSeconds: 3600,
          database: {
            status: 'connected',
            usersCount: 4,
            chatsCount: 2,
            messagesCount: 5,
          },
        },
      },
    ],
  },
  {
    id: 'system-stats',
    path: '/api/v1/stats',
    method: 'GET',
    tags: ['System'],
    summary: 'Tizim metrikalari va statistika',
    description: 'Foydalanuvchilar soni, umumiy xabarlar va so\'rovlar hisoblagichi.',
    requiresAuth: false,
    responses: [
      {
        status: 200,
        description: 'Statistik ma\'lumotlar',
        example: {
          success: true,
          totalUsers: 4,
          onlineUsers: 2,
          totalChats: 2,
          totalMessages: 5,
          totalSharedData: 3,
          totalRequestsHandled: 42,
        },
      },
    ],
  },
  {
    id: 'system-openapi',
    path: '/api/v1/openapi.json',
    method: 'GET',
    tags: ['System'],
    summary: 'OpenAPI 3.1 JSON spetsifikatsiyasi',
    description: 'Swagger UI, Redoc, Postman yoki kod generatorlari uchun rasmiy OpenAPI schema JSON fayli.',
    requiresAuth: false,
    responses: [
      {
        status: 200,
        description: 'OpenAPI 3.1 JSON obyekti',
      },
    ],
  },
];
