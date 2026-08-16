import React, { useState, useMemo } from 'react';
import {
  Search,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Terminal,
  Zap,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react';
import { API_ENDPOINTS, API_TAGS } from '../data/endpointsData';
import { ApiEndpoint, HttpMethod } from '../types/api';

interface SwaggerDocsProps {
  onSelectEndpointForSandbox: (endpointId: string) => void;
}

const methodColorMap: Record<HttpMethod, { bg: string; text: string; border: string; badge: string }> = {
  GET: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
  POST: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
  },
  PATCH: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  PUT: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  DELETE: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  },
};

export const SwaggerDocs: React.FC<SwaggerDocsProps> = ({ onSelectEndpointForSandbox }) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({
    'auth-login': true,
    'messages-send': true,
  });
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const filteredEndpoints = useMemo(() => {
    return API_ENDPOINTS.filter((ep) => {
      const matchTag = selectedTag === 'all' || ep.tags.includes(selectedTag);
      const matchSearch =
        !searchQuery ||
        ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.method.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTag && matchSearch;
    });
  }, [selectedTag, searchQuery]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { all: API_ENDPOINTS.length };
    API_TAGS.forEach((tag) => {
      counts[tag.name] = API_ENDPOINTS.filter((ep) => ep.tags.includes(tag.name)).length;
    });
    return counts;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Intro Hero Card */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-6 sm:p-7 mb-8 text-white shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>OPENAPI 3.1 & REST ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              api.saburov.uz REST API Dokumentatsiyasi
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Foydalanuvchilar o'rtasida real-vaqt xabarlar, chatlar, IoT telemetriya va tuzilgan JSON ma'lumotlar almashish uchun Node.js platformasi. Barcha endpointlar Swagger UI va Redoc formatida to'liq hujjatlashtirilgan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/api/v1/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-200 transition-colors shadow-sm"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>openapi.json</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="/api/v1/health"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 rounded text-xs font-medium text-emerald-300 transition-colors shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Health Check</span>
            </a>
          </div>
        </div>

        {/* Quick specs pill row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-700/80 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Protokol:</span>
            <span className="font-semibold text-slate-200 font-mono">HTTP/1.1 & HTTPS</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Autentifikatsiya:</span>
            <span className="font-semibold text-slate-200 font-mono">JWT Bearer Token</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Barcha Endpointlar:</span>
            <span className="font-semibold text-indigo-400 font-mono">{API_ENDPOINTS.length} ta Endpoint</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Platformalar:</span>
            <span className="font-semibold text-slate-200">Flutter, iOS, Android, Web</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar categories */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Endpointlarni qidirish..."
              className="w-full bg-[#1E293B] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Tag filters */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-3 space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 py-2 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>BO'LIMLAR</span>
            </div>

            <button
              onClick={() => setSelectedTag('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                selectedTag === 'all'
                  ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Barcha Endpointlar</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                {tagCounts['all']}
              </span>
            </button>

            {API_TAGS.map((tag) => (
              <button
                key={tag.name}
                onClick={() => setSelectedTag(tag.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                  selectedTag === tag.name
                    ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3 h-3 opacity-60" />
                  <span>{tag.name}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                  {tagCounts[tag.name] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Sandbox Teaser */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
              <Terminal className="w-4 h-4" />
              <span>Jonli API Sinovlari</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Har qanday endpointni brauzerda to'g'ridan-to'g'ri sinab ko'rish uchun "Sandboxda sinash" tugmasini bosing.
            </p>
          </div>
        </div>

        {/* Endpoints List */}
        <div className="lg:col-span-9 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Topildi: <strong className="text-slate-200">{filteredEndpoints.length}</strong> ta endpoint
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const allOpen: Record<string, boolean> = {};
                  filteredEndpoints.forEach((e) => (allOpen[e.id] = true));
                  setExpandedEndpoints(allOpen);
                }}
                className="hover:text-white text-indigo-400 font-medium text-xs"
              >
                Hammasini ochish
              </button>
              <span>•</span>
              <button
                onClick={() => setExpandedEndpoints({})}
                className="hover:text-white text-slate-400 text-xs"
              >
                Yopish
              </button>
            </div>
          </div>

          {filteredEndpoints.length === 0 ? (
            <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-medium text-slate-300">Mos keladigan endpoint topilmadi</p>
              <p className="text-xs text-slate-500 mt-1">Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang.</p>
            </div>
          ) : (
            filteredEndpoints.map((endpoint) => {
              const isExpanded = !!expandedEndpoints[endpoint.id];
              const colorInfo = methodColorMap[endpoint.method];

              return (
                <div
                  key={endpoint.id}
                  id={endpoint.id}
                  className={`bg-[#1E293B] border rounded-xl transition-all duration-200 overflow-hidden shadow-sm ${
                    isExpanded ? 'border-slate-700 ring-1 ring-slate-700' : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {/* Collapsed Header */}
                  <div
                    onClick={() => toggleEndpoint(endpoint.id)}
                    className="p-3.5 sm:p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider ${colorInfo.badge}`}>
                        {endpoint.method}
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-semibold text-slate-200 break-all">
                        {endpoint.path}
                      </span>
                      {endpoint.requiresAuth ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                          <Lock className="w-3 h-3" />
                          <span>JWT AUTH</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                          <Unlock className="w-3 h-3" />
                          <span>PUBLIC</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                        {endpoint.summary}
                      </span>
                      <div className="text-slate-400 p-0.5">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-4 pb-5 pt-3 sm:px-5 sm:pb-5 border-t border-slate-700/80 bg-[#0F172A] space-y-5">
                      {/* Summary & Description */}
                      <div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium mb-1">
                          {endpoint.summary}
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {endpoint.description}
                        </p>
                      </div>

                      {/* Action buttons bar */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEndpointForSandbox(endpoint.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium shadow-sm transition-colors"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Sandboxda sinash</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const cUrl = `curl -X ${endpoint.method} "https://api.saburov.uz${endpoint.path}" ${
                              endpoint.requiresAuth ? '-H "Authorization: Bearer <YOUR_JWT_TOKEN>" ' : ''
                            }-H "Content-Type: application/json" ${
                              endpoint.requestBody?.example
                                ? `-d '${JSON.stringify(endpoint.requestBody.example)}'`
                                : ''
                            }`;
                            handleCopy(cUrl, `curl-${endpoint.id}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs font-medium transition-colors"
                        >
                          {copiedMap[`curl-${endpoint.id}`] ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>cURL nusxalash</span>
                        </button>
                      </div>

                      {/* Parameters Table (if any) */}
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                              PARAMETRLAR (PARAMETERS)
                            </span>
                            <div className="h-px flex-1 bg-slate-800" />
                          </div>
                          <div className="overflow-x-auto rounded-lg border border-slate-800">
                            <table className="w-full text-left text-xs text-slate-300">
                              <thead className="bg-slate-800/60 text-slate-400 font-semibold text-[11px]">
                                <tr>
                                  <th className="py-2 px-3">Nom</th>
                                  <th className="py-2 px-3">Joylashuvi</th>
                                  <th className="py-2 px-3">Turi</th>
                                  <th className="py-2 px-3">Majburiylik</th>
                                  <th className="py-2 px-3">Tavsif</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800">
                                {endpoint.parameters.map((param) => (
                                  <tr key={param.name} className="hover:bg-slate-800/30 font-mono">
                                    <td className="py-2 px-3 font-semibold text-indigo-300">{param.name}</td>
                                    <td className="py-2 px-3 text-slate-400">{param.in}</td>
                                    <td className="py-2 px-3 text-emerald-400">{param.type}</td>
                                    <td className="py-2 px-3">
                                      {param.required ? (
                                        <span className="text-red-400 font-sans text-[11px] font-medium">Majburiy</span>
                                      ) : (
                                        <span className="text-slate-500 font-sans text-[11px]">Ixtiyoriy</span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 font-sans text-slate-400">
                                      {param.description || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Request Body JSON (if any) */}
                      {endpoint.requestBody && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 mr-4">
                              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                                SO'ROV TANASI (REQUEST BODY)
                              </span>
                              <div className="h-px flex-1 bg-slate-800" />
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              application/json
                            </span>
                          </div>
                          <div className="relative bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-slate-200 overflow-x-auto">
                            <button
                              onClick={() =>
                                handleCopy(
                                  JSON.stringify(endpoint.requestBody?.example, null, 2),
                                  `req-${endpoint.id}`
                                )
                              }
                              className="absolute right-2.5 top-2.5 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                              title="JSON nusxalash"
                            >
                              {copiedMap[`req-${endpoint.id}`] ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <pre className="text-indigo-300">
                              {JSON.stringify(endpoint.requestBody.example || {}, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Response Examples */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                            JAVOBLAR (RESPONSES)
                          </span>
                          <div className="h-px flex-1 bg-slate-800" />
                        </div>
                        <div className="space-y-2">
                          {endpoint.responses.map((resp) => (
                            <div
                              key={resp.status}
                              className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                                      resp.status < 300
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    }`}
                                  >
                                    {resp.status}
                                  </span>
                                  <span className="text-xs text-slate-300 font-medium">
                                    {resp.description}
                                  </span>
                                </div>
                                {resp.example && (
                                  <button
                                    onClick={() =>
                                      handleCopy(
                                        JSON.stringify(resp.example, null, 2),
                                        `resp-${endpoint.id}-${resp.status}`
                                      )
                                    }
                                    className="text-slate-400 hover:text-slate-200 text-xs p-1"
                                    title="Nusxalash"
                                  >
                                    {copiedMap[`resp-${endpoint.id}-${resp.status}`] ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                              {resp.example && (
                                <pre className="font-mono text-xs text-emerald-400 bg-slate-900/90 p-3 rounded overflow-x-auto border border-slate-800">
                                  {JSON.stringify(resp.example, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
