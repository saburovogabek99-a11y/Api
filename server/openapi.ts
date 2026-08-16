export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'api.saburov.uz — Unified Real-time Messaging & Data Exchange API',
    version: '1.2.0',
    description: `
**api.saburov.uz** - Foydalanuvchilar o'rtasida real-vaqt xabarlar, tuzilmalashtirilgan ma'lumotlar, fayllar va media almashish uchun rasmiy Node.js REST API servisi.

### Asosiy Imkoniyatlar:
- **Autentifikatsiya & Foydalanuvchilar:** JWT bearer tokenli xavfsiz ro'yxatdan o'tish, kirish va profil boshqaruvi.
- **Xabarlar & Chatlar:** Yakkama-yakka (direct) va guruh suhbatlari, matn, rasm, fayl, ma'lumotlar paketi, emojilar va o'qilganlik holati.
- **Ma'lumotlar Almashinuvi (Data Exchange):** Foydalanuvchilar va mobil ilovalar o'rtasida tuzilgan JSON ma'lumotlar, IoT telemetriya, kesh sinxronizatsiyasi va e'lonlar.
- **Fayl & Media Xotirasi:** Rasmlar, hujjatlar va fayllarni yuklash hamda metadata olish.
- **Mobil Ilovalar Uchun Tayyor:** Flutter (Dart), Android (Kotlin), iOS (Swift), React Native uchun moslashtirilgan.

### Baza URL manzillari:
- Ishlab chiqish: \`http://localhost:3000/api/v1\`
- Rasmiy Production: \`https://api.saburov.uz/api/v1\`
    `,
    contact: {
      name: 'Saburov API Platform Team',
      url: 'https://api.saburov.uz',
      email: 'support@saburov.uz',
    },
    license: {
      name: 'MIT License',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Joriy server (Local / Preview sandbox)',
    },
    {
      url: 'https://api.saburov.uz/api/v1',
      description: 'Rasmiy Production API server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Ro\'yxatdan o\'tish, JWT token olish, profilni yangilash' },
    { name: 'Users', description: 'Foydalanuvchilarni qidirish va profillarni ko\'rish' },
    { name: 'Chats', description: 'Guruh va yakkama-yakka suhbatlar boshqaruvi' },
    { name: 'Messages', description: 'Xabar yuborish, tahrirlash, o\'chirish va reaksiyalar' },
    { name: 'Data Exchange', description: 'Ma\'lumotlar paketi, telemetriya, postlar va sinxronizatsiya' },
    { name: 'Storage', description: 'Fayllar va medialarni yuklash' },
    { name: 'System', description: 'Server holati, statistika va OpenAPI spetsifikatsiyasi' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT tokeningizni "Bearer <token>" formatida yuboring. Tokenni /api/v1/auth/login orqali oling.',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_saburov_01' },
          username: { type: 'string', example: 'jasur_saburov' },
          email: { type: 'string', format: 'email', example: 'jasur@saburov.uz' },
          fullName: { type: 'string', example: 'Jasur Saburov' },
          avatarUrl: { type: 'string', format: 'uri', example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
          phone: { type: 'string', example: '+998 90 123 45 67' },
          bio: { type: 'string', example: 'Lead Architect & Founder' },
          status: { type: 'string', enum: ['online', 'offline', 'away', 'busy'], example: 'online' },
          lastSeen: { type: 'string', format: 'date-time', example: '2026-08-16T10:00:00.000Z' },
          role: { type: 'string', enum: ['user', 'admin', 'moderator'], example: 'admin' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-01-10T08:00:00.000Z' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'msg_001' },
          chatId: { type: 'string', example: 'chat_group_main' },
          senderId: { type: 'string', example: 'usr_saburov_01' },
          senderName: { type: 'string', example: 'Jasur Saburov' },
          senderAvatar: { type: 'string', example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
          text: { type: 'string', example: 'Salom, yangi API endpointlari tayyor!' },
          type: { type: 'string', enum: ['text', 'image', 'file', 'audio', 'system', 'data'], example: 'text' },
          mediaUrl: { type: 'string', nullable: true },
          dataPayload: { type: 'object', nullable: true },
          reactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                emoji: { type: 'string', example: '👍' },
                userId: { type: 'string', example: 'usr_malika_02' },
                username: { type: 'string', example: 'malika_ali' },
              },
            },
          },
          readBy: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                userId: { type: 'string', example: 'usr_malika_02' },
                readAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          isEdited: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Chat: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'chat_group_main' },
          type: { type: 'string', enum: ['direct', 'group', 'channel'], example: 'group' },
          title: { type: 'string', example: 'Saburov Mobile Dev Core' },
          description: { type: 'string', example: 'Mobil dasturchilar va API jamoasi guruhi' },
          avatarUrl: { type: 'string', format: 'uri' },
          creatorId: { type: 'string', example: 'usr_saburov_01' },
          participantIds: { type: 'array', items: { type: 'string' } },
          lastMessage: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              senderId: { type: 'string' },
              senderName: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      SharedData: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'data_telemetry_2026' },
          authorId: { type: 'string', example: 'usr_aziza_04' },
          authorName: { type: 'string', example: 'Aziza Rahimova' },
          authorAvatar: { type: 'string' },
          category: { type: 'string', enum: ['report', 'sensor_data', 'feed_post', 'file_share', 'config', 'announcement'] },
          title: { type: 'string', example: 'Toshkent Sensor Telemetriyasi' },
          description: { type: 'string' },
          payload: { type: 'object' },
          tags: { type: 'array', items: { type: 'string' } },
          visibility: { type: 'string', enum: ['public', 'private', 'restricted'] },
          likes: { type: 'array', items: { type: 'string' } },
          downloadsCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Amaliyot muvaffaqiyatli bajarildi' },
          data: { type: 'object' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Bad Request' },
          message: { type: 'string', example: 'Xatolik haqida batafsil ma\'lumot' },
          code: { type: 'string', example: 'INVALID_INPUT' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Yangi foydalanuvchini ro\'yxatdan o\'tkazish',
        description: 'Tizimda yangi akkaunt yaratadi va darhol JWT token qaytaradi.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password', 'fullName'],
                properties: {
                  username: { type: 'string', example: 'anvar_dev' },
                  email: { type: 'string', format: 'email', example: 'anvar@saburov.uz' },
                  password: { type: 'string', minLength: 6, example: 'secret2026' },
                  fullName: { type: 'string', example: 'Anvar Zokirov' },
                  phone: { type: 'string', example: '+998 90 555 11 22' },
                  bio: { type: 'string', example: 'Full-stack & Mobile engineer' },
                  avatarUrl: { type: 'string', example: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tdi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Username yoki Email allaqachon band',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Tizimga kirish va JWT token olish',
        description: 'Username/email va parol orqali tizimga kirish.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'jasur_saburov' },
                  password: { type: 'string', example: 'saburov2026' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Muvaffaqiyatli kirildi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    expiresIn: { type: 'string', example: '7d' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Parol yoki login noto\'g\'ri',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Joriy foydalanuvchi profilini olish',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Joriy foydalanuvchi ma\'lumotlari',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Avtorizatsiyadan o\'tilmagan',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
          },
        },
      },
      patch: {
        tags: ['Auth'],
        summary: 'Joriy foydalanuvchi profilini yangilash',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', example: 'Jasur B. Saburov' },
                  bio: { type: 'string', example: 'Senior Architect & Developer' },
                  status: { type: 'string', enum: ['online', 'offline', 'away', 'busy'], example: 'online' },
                  avatarUrl: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profil yangilandi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Foydalanuvchilar ro\'yxatini olish va qidirish',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Ism, username yoki bio bo\'yicha qidiruv' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['online', 'offline', 'away', 'busy'] } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: {
          200: {
            description: 'Foydalanuvchilar ro\'yxati',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    total: { type: 'integer', example: 4 },
                    users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Foydalanuvchi batafsil profilini olish',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'usr_saburov_01' }],
        responses: {
          200: {
            description: 'Foydalanuvchi topildi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          404: { description: 'Foydalanuvchi topilmadi' },
        },
      },
    },
    '/chats': {
      get: {
        tags: ['Chats'],
        summary: 'Foydalanuvchining barcha chatlari ro\'yxatini olish',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Chatlar ro\'yxati',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    chats: { type: 'array', items: { $ref: '#/components/schemas/Chat' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Chats'],
        summary: 'Yangi chat yoki guruh yaratish',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['participantIds'],
                properties: {
                  type: { type: 'string', enum: ['direct', 'group', 'channel'], default: 'direct' },
                  title: { type: 'string', example: 'Yangi Loyiha Guruhi' },
                  description: { type: 'string', example: 'Loyiha muhokamasi uchun' },
                  participantIds: { type: 'array', items: { type: 'string' }, example: ['usr_malika_02'] },
                  avatarUrl: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Chat yaratildi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    chat: { $ref: '#/components/schemas/Chat' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/chats/{chatId}/messages': {
      get: {
        tags: ['Messages'],
        summary: 'Chatdagi barcha xabarlarni olish',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'chatId', in: 'path', required: true, schema: { type: 'string' }, example: 'chat_group_main' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Xabarlar ro\'yxati',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    chatId: { type: 'string' },
                    total: { type: 'integer' },
                    messages: { type: 'array', items: { $ref: '#/components/schemas/Message' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Messages'],
        summary: 'Chatga yangi xabar yoki ma\'lumot yuborish',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'chatId', in: 'path', required: true, schema: { type: 'string' }, example: 'chat_group_main' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  text: { type: 'string', example: 'Assalomu alaykum!' },
                  type: { type: 'string', enum: ['text', 'image', 'file', 'audio', 'data'], default: 'text' },
                  mediaUrl: { type: 'string' },
                  dataPayload: { type: 'object', description: 'Strukturalashgan JSON ma\'lumot' },
                  replyToMessageId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Xabar yetkazildi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { $ref: '#/components/schemas/Message' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/messages/{messageId}/react': {
      post: {
        tags: ['Messages'],
        summary: 'Xabarga reaksiya (emoji) bildirish',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'messageId', in: 'path', required: true, schema: { type: 'string' }, example: 'msg_001' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['emoji'],
                properties: {
                  emoji: { type: 'string', example: '🔥' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Reaksiya yangilandi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    reactions: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/messages/{messageId}/read': {
      post: {
        tags: ['Messages'],
        summary: 'Xabarni o\'qilgan deb belgilash',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'messageId', in: 'path', required: true, schema: { type: 'string' }, example: 'msg_001' }],
        responses: {
          200: {
            description: 'Xabar o\'qildi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    messageId: { type: 'string' },
                    readAt: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/messages/{messageId}': {
      delete: {
        tags: ['Messages'],
        summary: 'Xabarni o\'chirish',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'messageId', in: 'path', required: true, schema: { type: 'string' }, example: 'msg_001' }],
        responses: {
          200: {
            description: 'Xabar o\'chirildi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Xabar muvaffaqiyatli o\'chirildi' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/data/feed': {
      get: {
        tags: ['Data Exchange'],
        summary: 'Barcha ulashilgan ma\'lumotlar to\'plamini olish (Data Feed)',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['report', 'sensor_data', 'feed_post', 'file_share', 'config', 'announcement'] } },
          { name: 'tag', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Ma\'lumotlar ro\'yxati',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    total: { type: 'integer' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/SharedData' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/data/publish': {
      post: {
        tags: ['Data Exchange'],
        summary: 'Yangi ma\'lumotlar paketi yoki e\'lon nashr etish',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'category', 'payload'],
                properties: {
                  category: { type: 'string', enum: ['report', 'sensor_data', 'feed_post', 'file_share', 'config', 'announcement'], example: 'sensor_data' },
                  title: { type: 'string', example: 'Samarqand Ob-havo & IoT Ma\'lumotlari' },
                  description: { type: 'string', example: 'Real-vaqt namlik va harorat' },
                  payload: {
                    type: 'object',
                    example: { temp: 28.2, humidity: 45, station: 'ST-09' },
                  },
                  tags: { type: 'array', items: { type: 'string' }, example: ['iot', 'weather', 'samarkand'] },
                  visibility: { type: 'string', enum: ['public', 'private', 'restricted'], default: 'public' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Ma\'lumot nashr qilindi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/SharedData' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/data/sync': {
      post: {
        tags: ['Data Exchange'],
        summary: 'Mobil ilovalar uchun oflayn ma\'lumotlar sinxronizatsiyasi (Batch Sync)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  lastSyncTimestamp: { type: 'string', format: 'date-time', example: '2026-08-15T00:00:00.000Z' },
                  clientDevice: { type: 'string', example: 'Flutter-iOS-19.4' },
                  clientChanges: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        action: { type: 'string', enum: ['create_message', 'like_post', 'update_status'] },
                        payload: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Sinxronizatsiya muvaffaqiyatli',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    syncedAt: { type: 'string' },
                    newMessagesCount: { type: 'integer' },
                    newFeedItemsCount: { type: 'integer' },
                    delta: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/storage/upload': {
      post: {
        tags: ['Storage'],
        summary: 'Fayl yoki rasmni serverga yuklash (Base64 / Multipart)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['filename', 'mimeType', 'base64Data'],
                properties: {
                  filename: { type: 'string', example: 'avatar_photo.png' },
                  mimeType: { type: 'string', example: 'image/png' },
                  base64Data: { type: 'string', example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Fayl yuklandi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    file: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        url: { type: 'string', format: 'uri' },
                        filename: { type: 'string' },
                        size: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'API servisi sog\'lomligi va holati (Health Check)',
        responses: {
          200: {
            description: 'Server faol holatda',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    service: { type: 'string', example: 'api.saburov.uz' },
                    version: { type: 'string', example: '1.2.0' },
                    uptimeSeconds: { type: 'number', example: 3420.5 },
                    timestamp: { type: 'string' },
                    database: { type: 'string', example: 'connected' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/stats': {
      get: {
        tags: ['System'],
        summary: 'Tizim statistikasi va metrikalari',
        responses: {
          200: {
            description: 'Statistik ma\'lumotlar',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalUsers: { type: 'integer', example: 4 },
                    totalChats: { type: 'integer', example: 2 },
                    totalMessages: { type: 'integer', example: 5 },
                    totalSharedData: { type: 'integer', example: 3 },
                    totalFiles: { type: 'integer', example: 2 },
                    totalRequestsHandled: { type: 'integer', example: 128 },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
