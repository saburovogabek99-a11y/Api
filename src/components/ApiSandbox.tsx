import React, { useState, useEffect } from 'react';
import {
  Play,
  Send,
  Lock,
  Unlock,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Terminal,
  Code2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { API_ENDPOINTS } from '../data/endpointsData';
import { ApiEndpoint, HttpMethod } from '../types/api';

interface ApiSandboxProps {
  initialEndpointId?: string;
}

const PRESET_USERS = [
  {
    id: 'usr_saburov_01',
    name: 'Jasur Saburov (Admin)',
    username: 'jasur_saburov',
    password: 'saburov2026',
  },
  {
    id: 'usr_malika_02',
    name: 'Malika Aliyeva (Mobile Dev)',
    username: 'malika_ali',
    password: 'saburov2026',
  },
  {
    id: 'usr_dilshod_03',
    name: 'Dilshod Karimov (Android)',
    username: 'dilshod_dev',
    password: 'saburov2026',
  },
];

export const ApiSandbox: React.FC<ApiSandboxProps> = ({ initialEndpointId }) => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(
    initialEndpointId || 'messages-send'
  );
  const [activeAuthUser, setActiveAuthUser] = useState<string>('usr_saburov_01');
  const [jwtToken, setJwtToken] = useState<string>('');
  const [customToken, setCustomToken] = useState<string>('');
  const [useCustomToken, setUseCustomToken] = useState<boolean>(false);

  const [requestPath, setRequestPath] = useState<string>('');
  const [requestMethod, setRequestMethod] = useState<HttpMethod>('POST');
  const [requestBodyText, setRequestBodyText] = useState<string>('{}');
  const [customHeaders, setCustomHeaders] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<
    'flutter' | 'kotlin' | 'swift' | 'reactnative' | 'curl' | 'js'
  >('flutter');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentEndpoint = API_ENDPOINTS.find((e) => e.id === selectedEndpointId) || API_ENDPOINTS[0];

  // Auto-login selected preset user to obtain fresh JWT token
  useEffect(() => {
    const user = PRESET_USERS.find((u) => u.id === activeAuthUser);
    if (user) {
      fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, password: user.password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            setJwtToken(data.token);
          }
        })
        .catch((err) => console.error('Auth login error:', err));
    }
  }, [activeAuthUser]);

  // Sync endpoint details when selection changes
  useEffect(() => {
    if (currentEndpoint) {
      setRequestPath(currentEndpoint.path);
      setRequestMethod(currentEndpoint.method);
      if (currentEndpoint.requestBody?.example) {
        setRequestBodyText(JSON.stringify(currentEndpoint.requestBody.example, null, 2));
      } else {
        setRequestBodyText('{}');
      }
    }
  }, [selectedEndpointId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    setResponseDuration(null);

    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const tokenToUse = useCustomToken ? customToken.trim() : jwtToken;
      if (tokenToUse) {
        headers['Authorization'] = `Bearer ${tokenToUse}`;
      }

      // Parse custom headers if any
      if (customHeaders.trim()) {
        customHeaders.split('\n').forEach((line) => {
          const colonIdx = line.indexOf(':');
          if (colonIdx > -1) {
            const key = line.substring(0, colonIdx).trim();
            const val = line.substring(colonIdx + 1).trim();
            if (key && val) headers[key] = val;
          }
        });
      }

      let bodyData: any = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(requestMethod) && requestBodyText.trim()) {
        try {
          bodyData = JSON.stringify(JSON.parse(requestBodyText));
        } catch (e) {
          bodyData = requestBodyText;
        }
      }

      const res = await fetch(requestPath, {
        method: requestMethod,
        headers,
        body: bodyData,
      });

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      setResponseStatus(res.status);
      setResponseDuration(durationMs);

      // Collect response headers
      const resHeadersObj: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeadersObj[key] = val;
      });
      setResponseHeaders(resHeadersObj);

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        setResponseBody(json);
      } else {
        const text = await res.text();
        setResponseBody(text);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setResponseStatus(0);
      setResponseDuration(Math.round(endTime - startTime));
      setResponseBody({
        error: 'Network Error / Fetch Failed',
        message: err.message || 'Serverga so\'rov yuborishda xatolik yuz berdi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate code snippet based on active tab
  const getCodeSnippet = () => {
    const effectiveToken = useCustomToken ? customToken : jwtToken || '<JWT_TOKEN>';
    const url = `https://api.saburov.uz${requestPath}`;
    const cleanBody = requestBodyText.trim();

    switch (activeSnippetTab) {
      case 'flutter':
        return `// Dart / Flutter (http package)
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> makeApiRequest() async {
  final url = Uri.parse('${url}');
  final headers = {
    'Content-Type': 'application/json',
    ${currentEndpoint.requiresAuth ? `'Authorization': 'Bearer \${userToken}',` : ''}
  };
  
  ${
    ['POST', 'PUT', 'PATCH'].includes(requestMethod)
      ? `final body = jsonEncode(${cleanBody});
  final response = await http.${requestMethod.toLowerCase()}(url, headers: headers, body: body);`
      : `final response = await http.${requestMethod.toLowerCase()}(url, headers: headers);`
  }

  if (response.statusCode >= 200 && response.statusCode < 300) {
    final data = jsonDecode(response.body);
    print('Muvaffaqiyatli: $data');
  } else {
    print('Xatolik: \${response.statusCode} - \${response.body}');
  }
}`;

      case 'kotlin':
        return `// Kotlin / Android (Retrofit / OkHttp)
val client = OkHttpClient()
val mediaType = "application/json; charset=utf-8".toMediaType()

${
  ['POST', 'PUT', 'PATCH'].includes(requestMethod)
    ? `val body = """${cleanBody}""".toRequestBody(mediaType)
val request = Request.Builder()
    .url("${url}")
    ${currentEndpoint.requiresAuth ? '.addHeader("Authorization", "Bearer $userJwtToken")\n    ' : ''}.post(body)
    .build()`
    : `val request = Request.Builder()
    .url("${url}")
    ${currentEndpoint.requiresAuth ? '.addHeader("Authorization", "Bearer $userJwtToken")\n    ' : ''}.get()
    .build()`
}

client.newCall(request).enqueue(object : Callback {
    override fun onFailure(call: Call, e: IOException) {
        e.printStackTrace()
    }
    override fun onResponse(call: Call, response: Response) {
        val responseBody = response.body?.string()
        println("Server Javobi: $responseBody")
    }
})`;

      case 'swift':
        return `// Swift / iOS (URLSession)
import Foundation

guard let url = URL(string: "${url}") else { return }
var request = URLRequest(url: url)
request.httpMethod = "${requestMethod}"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
${currentEndpoint.requiresAuth ? 'request.setValue("Bearer \\(jwtToken)", forHTTPHeaderField: "Authorization")' : ''}

${
  ['POST', 'PUT', 'PATCH'].includes(requestMethod)
    ? `let jsonString = """
${cleanBody}
"""
request.httpBody = jsonString.data(using: .utf8)`
    : ''
}

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let data = data, let jsonString = String(data: data, encoding: .utf8) {
        print("Response: \\(jsonString)")
    }
}
task.resume()`;

      case 'reactnative':
        return `// React Native / TypeScript (Axios)
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.saburov.uz/api/v1',
  headers: {
    'Content-Type': 'application/json',
    ${currentEndpoint.requiresAuth ? `'Authorization': \`Bearer \${userToken}\`,` : ''}
  },
});

export const callEndpoint = async () => {
  try {
    ${
      ['POST', 'PUT', 'PATCH'].includes(requestMethod)
        ? `const response = await api.${requestMethod.toLowerCase()}('${requestPath.replace('/api/v1', '')}', ${cleanBody});`
        : `const response = await api.${requestMethod.toLowerCase()}('${requestPath.replace('/api/v1', '')}');`
    }
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};`;

      case 'curl':
        return `curl -X ${requestMethod} "${url}" \\
  -H "Content-Type: application/json" \\
  ${currentEndpoint.requiresAuth ? `-H "Authorization: Bearer ${effectiveToken}" \\` : ''}
  ${
    ['POST', 'PUT', 'PATCH'].includes(requestMethod)
      ? `-d '${cleanBody.replace(/'/g, "\\'")}'`
      : ''
  }`;

      case 'js':
        return `// JavaScript (Fetch API)
const response = await fetch('${requestPath}', {
  method: '${requestMethod}',
  headers: {
    'Content-Type': 'application/json',
    ${currentEndpoint.requiresAuth ? `'Authorization': 'Bearer \${jwtToken}',` : ''}
  },
  ${
    ['POST', 'PUT', 'PATCH'].includes(requestMethod)
      ? `body: JSON.stringify(${cleanBody}),`
      : ''
  }
});

const data = await response.json();
console.log(data);`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 sm:p-6 mb-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>INTERACTIVE API TESTING</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              API Sandbox & Console
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Barcha so'rovlar to'g'ridan-to'g'ri local Node.js Express serveriga yuboriladi. Test qilish uchun avtomatik foydalanuvchi akkauntini tanlang.
            </p>
          </div>

          {/* Quick User Switcher for Bearer Auth */}
          <div className="bg-[#0F172A] border border-slate-700 rounded-lg p-3 text-xs w-full md:w-auto">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-slate-300 font-medium flex items-center gap-1.5 text-[11px]">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Test Akkaunti (Bearer Auth):</span>
              </span>
              <button
                onClick={() => setUseCustomToken(!useCustomToken)}
                className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium"
              >
                {useCustomToken ? 'Preset tanlash' : 'Maxsus token'}
              </button>
            </div>

            {!useCustomToken ? (
              <select
                value={activeAuthUser}
                onChange={(e) => setActiveAuthUser(e.target.value)}
                className="w-full bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
              >
                {PRESET_USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} (@{user.username})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="JWT tokenni shu yerga kiriting..."
                className="w-full bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Request Configuration Panel (Left) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold flex items-center gap-2">
                <Send className="w-3.5 h-3.5" />
                <span>So'rovni Sozlash (Request)</span>
              </h3>
              <select
                value={selectedEndpointId}
                onChange={(e) => setSelectedEndpointId(e.target.value)}
                className="bg-[#0F172A] border border-slate-700 rounded px-2.5 py-1 text-xs text-indigo-300 font-medium focus:outline-none focus:border-indigo-500 max-w-[200px]"
              >
                {API_ENDPOINTS.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.method} {ep.path}
                  </option>
                ))}
              </select>
            </div>

            {/* Method & URL bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Metod va Yo'l (Endpoint Path)
              </label>
              <div className="flex gap-2">
                <select
                  value={requestMethod}
                  onChange={(e) => setRequestMethod(e.target.value as HttpMethod)}
                  className="bg-[#0F172A] border border-slate-700 rounded px-3 py-2 text-xs font-mono font-bold text-indigo-400 focus:outline-none focus:border-indigo-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PATCH">PATCH</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input
                  type="text"
                  value={requestPath}
                  onChange={(e) => setRequestPath(e.target.value)}
                  className="flex-1 bg-[#0F172A] border border-slate-700 rounded px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="/api/v1/..."
                />
              </div>
            </div>

            {/* Bearer Token Status Indicator */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {currentEndpoint.requiresAuth ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-300 text-[11px]">
                      Header: <code className="text-amber-400 font-mono">Authorization: Bearer ...</code>
                    </span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400 text-[11px]">Ochiq endpoint (Auth talab qilinmaydi)</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-emerald-400 font-medium font-mono">
                {jwtToken ? '✓ TOKEN TAYYOR' : 'TOKEN OLINMOQDA...'}
              </span>
            </div>

            {/* Request Body JSON Editor */}
            {['POST', 'PUT', 'PATCH'].includes(requestMethod) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    So'rov Tanasi (Request Body JSON)
                  </label>
                  <button
                    onClick={() => {
                      if (currentEndpoint.requestBody?.example) {
                        setRequestBodyText(
                          JSON.stringify(currentEndpoint.requestBody.example, null, 2)
                        );
                      }
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Namuna yuklash</span>
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-indigo-300 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
                  placeholder='{"key": "value"}'
                />
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleExecuteRequest}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>So'rovni Yuborish (Send Request)</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile SDK Code Generator Section */}
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 sm:p-6 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                <Code2 className="w-4 h-4" />
                <span>Mobil SDK Kod Generator</span>
              </div>
              <button
                onClick={() => handleCopy(getCodeSnippet(), 'snippet')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs font-medium transition-colors"
              >
                {copiedKey === 'snippet' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Nusxalash</span>
              </button>
            </div>

            {/* Snippet Language Switcher */}
            <div className="flex items-center overflow-x-auto gap-1 border-b border-slate-700/80 pb-2 text-xs">
              <button
                onClick={() => setActiveSnippetTab('flutter')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeSnippetTab === 'flutter'
                    ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Flutter (Dart)
              </button>
              <button
                onClick={() => setActiveSnippetTab('kotlin')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeSnippetTab === 'kotlin'
                    ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Android (Kotlin)
              </button>
              <button
                onClick={() => setActiveSnippetTab('swift')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeSnippetTab === 'swift'
                    ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                iOS (Swift)
              </button>
              <button
                onClick={() => setActiveSnippetTab('reactnative')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeSnippetTab === 'reactnative'
                    ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                React Native
              </button>
              <button
                onClick={() => setActiveSnippetTab('curl')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeSnippetTab === 'curl'
                    ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL
              </button>
            </div>

            {/* Snippet Code Box */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-slate-300 overflow-x-auto max-h-64">
              <pre className="text-indigo-300 whitespace-pre leading-relaxed">
                {getCodeSnippet()}
              </pre>
            </div>
          </div>
        </div>

        {/* Live Response Panel (Right) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Server Javobi (Live Response)</span>
              </h3>

              {responseStatus !== null && (
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {responseStatus === 0 ? 'XATOLIK' : `${responseStatus}`}
                  </span>
                  {responseDuration !== null && (
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{responseDuration} ms</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Response Content or Placeholder */}
            {responseBody === null && !isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Terminal className="w-10 h-10 mb-3 text-slate-600" />
                <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Hali hech qanday so'rov yuborilmadi
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Chap tomondagi "So'rovni Yuborish" tugmasini bosing va natijani real vaqtda ko'ring.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-medium font-mono text-slate-300">Serverdan ma'lumot kutilmoqda...</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    JSON RESPONSE BODY
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(JSON.stringify(responseBody, null, 2), 'response-body')
                    }
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'response-body' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Nusxalash</span>
                  </button>
                </div>

                <div className="flex-1 bg-[#0F172A] border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-auto max-h-[500px]">
                  <pre
                    className={`whitespace-pre-wrap leading-relaxed ${
                      responseStatus && responseStatus >= 200 && responseStatus < 300
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {typeof responseBody === 'object'
                      ? JSON.stringify(responseBody, null, 2)
                      : String(responseBody)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
