import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Users,
  Database,
  Share2,
  Smile,
  Plus,
  RefreshCw,
  CheckCheck,
  Flame,
  ThumbsUp,
  Heart,
  Rocket,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DemoUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  token?: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: 'usr_saburov_01',
    name: 'Jasur Saburov',
    username: 'jasur_saburov',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Admin / API Lead',
  },
  {
    id: 'usr_malika_02',
    name: 'Malika Aliyeva',
    username: 'malika_ali',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'Flutter & iOS Dev',
  },
  {
    id: 'usr_dilshod_03',
    name: 'Dilshod Karimov',
    username: 'dilshod_dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Android Dev',
  },
];

export const QuickMessengerDemo: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<DemoUser>(DEMO_USERS[0]);
  const [token, setToken] = useState<string>('');
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('chat_group_main');
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'chat' | 'feed'>('chat');
  const [feedItems, setFeedItems] = useState<any[]>([]);

  // New Data publish form state
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [publishTitle, setPublishTitle] = useState<string>('');
  const [publishCategory, setPublishCategory] = useState<string>('sensor_data');
  const [publishJson, setPublishJson] = useState<string>(
    JSON.stringify({ location: 'Samarkand', metric: 'Solar Energy', value: 92.4 }, null, 2)
  );

  // Login as current user to get token
  useEffect(() => {
    fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser.username, password: 'saburov2026' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setToken(data.token);
        }
      })
      .catch((e) => console.error(e));
  }, [currentUser]);

  // Fetch chats
  const fetchChats = () => {
    if (!token) return;
    fetch('/api/v1/chats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.chats) {
          setChats(data.chats);
          if (data.chats.length > 0 && !activeChatId) {
            setActiveChatId(data.chats[0].id);
          }
        }
      })
      .catch((e) => console.error(e));
  };

  // Fetch messages for active chat
  const fetchMessages = () => {
    if (!token || !activeChatId) return;
    fetch(`/api/v1/chats/${activeChatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        }
      })
      .catch((e) => console.error(e));
  };

  // Fetch Feed items
  const fetchFeed = () => {
    fetch('/api/v1/data/feed')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setFeedItems(data.data);
        }
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    if (token) {
      fetchChats();
      fetchMessages();
      fetchFeed();
    }
  }, [token, activeChatId]);

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !token || !activeChatId) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/v1/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: messageInput.trim(),
          type: 'text',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessageInput('');
        fetchMessages();
        fetchChats();
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  // React to message
  const handleReaction = async (messageId: string, emoji: string) => {
    if (!token) return;
    try {
      await fetch(`/api/v1/messages/${messageId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      });
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  // Like Feed item
  const handleLikeFeed = async (dataId: string) => {
    if (!token) return;
    try {
      await fetch(`/api/v1/data/${dataId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFeed();
    } catch (err) {
      console.error(err);
    }
  };

  // Publish new Data payload
  const handlePublishData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !publishTitle.trim()) return;

    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(publishJson);
      } catch (e) {
        parsedPayload = { raw: publishJson };
      }

      await fetch('/api/v1/data/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: publishTitle.trim(),
          category: publishCategory,
          payload: parsedPayload,
          tags: ['demo', publishCategory, 'saburov'],
        }),
      });

      setShowPublishModal(false);
      setPublishTitle('');
      fetchFeed();
      setViewMode('feed');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Account Switcher */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 sm:p-6 mb-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>REAL-TIME API CLIENT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Live Chat & Data Exchange Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Ushbu demo to'liq <code className="text-indigo-400 font-mono">/api/v1/chats</code>, <code className="text-indigo-400 font-mono">/api/v1/messages</code> va <code className="text-indigo-400 font-mono">/api/v1/data</code> endpointlari orqali ishlaydi. Turli akkauntlar o'rtasida xabarlar va ma'lumotlar almashing!
            </p>
          </div>

          {/* Account selector cards */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
            {DEMO_USERS.map((u) => {
              const isSelected = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setCurrentUser(u)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left border transition-all ${
                    isSelected
                      ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/40'
                      : 'bg-[#0F172A] border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <p className="text-xs font-bold leading-none mb-0.5">{u.name}</p>
                    <p className="text-[10px] text-slate-400 leading-none font-mono">@{u.username}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Chat List or Data Feed Switcher */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 shadow-sm space-y-4">
            {/* View Mode Toggle */}
            <div className="grid grid-cols-2 gap-1 bg-[#0F172A] p-1 rounded-lg border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setViewMode('chat')}
                className={`py-1.5 px-3 rounded flex items-center justify-center gap-2 transition-colors ${
                  viewMode === 'chat'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chatlar ({chats.length})</span>
              </button>
              <button
                onClick={() => setViewMode('feed')}
                className={`py-1.5 px-3 rounded flex items-center justify-center gap-2 transition-colors ${
                  viewMode === 'feed'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Ma'lumotlar ({feedItems.length})</span>
              </button>
            </div>

            {/* Chat List View */}
            {viewMode === 'chat' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono uppercase tracking-wider text-[10px]">
                  <span>Suhbatlar</span>
                  <button
                    onClick={fetchChats}
                    className="p-1 hover:text-white transition-colors"
                    title="Yangilash"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {chats.map((chat) => {
                    const isActive = chat.id === activeChatId;
                    return (
                      <button
                        key={chat.id}
                        onClick={() => setActiveChatId(chat.id)}
                        className={`w-full p-3 rounded-lg text-left transition-all flex items-start gap-3 border ${
                          isActive
                            ? 'bg-indigo-500/15 border-indigo-500/40 text-slate-200 shadow-sm'
                            : 'bg-[#0F172A]/70 border-slate-700/70 text-slate-400 hover:border-slate-600 hover:bg-[#0F172A]'
                        }`}
                      >
                        <img
                          src={chat.avatarUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'}
                          alt={chat.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h4 className="text-xs font-bold text-slate-200 truncate">
                              {chat.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {chat.type === 'group' ? 'Guruh' : 'Direct'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {chat.lastMessage?.text || 'Yangi suhbat'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Data Feed items mini list */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold font-mono uppercase tracking-wider">
                    Ulashilgan Data Paketlar
                  </span>
                  <button
                    onClick={() => setShowPublishModal(true)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yangi Data</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {feedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200 text-xs truncate max-w-[180px]">
                          {item.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-2">
                        {item.description || 'JSON ma\'lumotlar to\'plami'}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                        <span className="font-mono">@{item.authorName}</span>
                        <button
                          onClick={() => handleLikeFeed(item.id)}
                          className="flex items-center gap-1 text-rose-400 hover:text-rose-300"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>{item.likes?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Chat Window with Live Messages */}
        <div className="lg:col-span-8">
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl shadow-md flex flex-col h-[580px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-[#0F172A]/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    {chats.find((c) => c.id === activeChatId)?.title || 'Guruh Suhbat'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Siz: <strong className="text-indigo-400">{currentUser.name}</strong> (@{currentUser.username}) sifatida yozmoqdasiz
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchMessages}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
                  title="Xabarlarni yangilash"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Yangilash</span>
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0F172A]/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                  <MessageSquare className="w-8 h-8 mb-2 text-slate-600" />
                  <p className="font-mono text-slate-400 uppercase tracking-wider">Ushbu chatda hali xabarlar yo'q</p>
                  <p className="text-slate-500 mt-0.5">Birinchi xabarni yozing!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                        isMe ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      <img
                        src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0 mt-1"
                      />
                      <div className="space-y-1">
                        <div
                          className={`flex items-center gap-2 text-[11px] text-slate-400 ${
                            isMe ? 'justify-end' : ''
                          }`}
                        >
                          <span className="font-semibold text-slate-300">{msg.senderName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div
                          className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                              : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                          }`}
                        >
                          <p>{msg.text}</p>

                          {/* Data payload rendering if structured message */}
                          {msg.dataPayload && (
                            <pre className="mt-2 p-2 rounded bg-black/40 text-[11px] font-mono text-indigo-200 overflow-x-auto border border-white/10">
                              {JSON.stringify(msg.dataPayload, null, 2)}
                            </pre>
                          )}
                        </div>

                        {/* Reactions Row */}
                        <div
                          className={`flex items-center gap-1.5 pt-0.5 flex-wrap ${
                            isMe ? 'justify-end' : ''
                          }`}
                        >
                          {/* Active Reactions */}
                          {msg.reactions &&
                            msg.reactions.map((r: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => handleReaction(msg.id, r.emoji)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:border-slate-600 transition-colors"
                              >
                                <span>{r.emoji}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{r.username}</span>
                              </button>
                            ))}

                          {/* Quick Emoji Adders */}
                          <div className="flex items-center gap-0.5 opacity-40 hover:opacity-100 transition-opacity">
                            {['👍', '❤️', '🔥', '🚀'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg.id, emoji)}
                                className="p-1 hover:scale-125 transition-transform text-xs"
                                title={`Reaksiya: ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-700 bg-[#0F172A] flex items-center gap-2"
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Xabarni yozing (masalan: Yangi API versiyasi chiqdi!)..."
                className="flex-1 bg-[#1E293B] border border-slate-700 rounded-lg px-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSending || !messageInput.trim()}
                className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Publish Data Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl max-w-lg w-full p-6 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-400 font-mono">
                <Database className="w-4 h-4" />
                <span>Yangi Ma'lumot Nashr Etish (/api/v1/data/publish)</span>
              </h3>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishData} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium text-[11px] font-mono">Sarlavha</label>
                <input
                  type="text"
                  required
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  placeholder="Masalan: Farg'ona Havo Sifati Sensorlari"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium text-[11px] font-mono">Kategoriya</label>
                <select
                  value={publishCategory}
                  onChange={(e) => setPublishCategory(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="sensor_data">Sensor & Telemetriya (sensor_data)</option>
                  <option value="report">Hisobot (report)</option>
                  <option value="config">Mobil Konfiguratsiya (config)</option>
                  <option value="announcement">E'lon (announcement)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium text-[11px] font-mono">JSON Payload</label>
                <textarea
                  rows={5}
                  value={publishJson}
                  onChange={(e) => setPublishJson(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded p-3 font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm transition-colors"
                >
                  Nashr qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
