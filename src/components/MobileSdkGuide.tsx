import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Copy,
  Check,
  Code2,
  FileCode,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const MobileSdkGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flutter' | 'kotlin' | 'swift' | 'reactnative'>('flutter');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const flutterClientCode = `// lib/services/saburov_api_client.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SaburovApiClient {
  static const String baseUrl = 'https://api.saburov.uz/api/v1';
  final _storage = const FlutterSecureStorage();

  // 1. Tizimga kirish va JWT token saqlash
  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('\$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['token'] != null) {
      await _storage.write(key: 'jwt_token', value: data['token']);
      return data;
    } else {
      throw Exception(data['message'] ?? 'Login xatoligi');
    }
  }

  // 2. Auth header bilan so'rov yuborish
  Future<Map<String, String>> _getHeaders() async {
    final token = await _storage.read(key: 'jwt_token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer \$token',
    };
  }

  // 3. Chatlar ro'yxatini olish
  Future<List<dynamic>> getChats() async {
    final headers = await _getHeaders();
    final response = await http.get(Uri.parse('\$baseUrl/chats'), headers: headers);
    final data = jsonDecode(response.body);
    return data['chats'] ?? [];
  }

  // 4. Xabar yuborish
  Future<Map<String, dynamic>> sendMessage(String chatId, String text, {Map<String, dynamic>? dataPayload}) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('\$baseUrl/chats/\$chatId/messages'),
      headers: headers,
      body: jsonEncode({
        'text': text,
        'type': dataPayload != null ? 'data' : 'text',
        if (dataPayload != null) 'dataPayload': dataPayload,
      }),
    );
    return jsonDecode(response.body);
  }

  // 5. Oflayn sinxronizatsiya (Offline Sync)
  Future<Map<String, dynamic>> syncOfflineData(String lastSyncIsoTimestamp) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('\$baseUrl/data/sync'),
      headers: headers,
      body: jsonEncode({
        'lastSyncTimestamp': lastSyncIsoTimestamp,
        'clientDevice': 'Flutter-Mobile',
      }),
    );
    return jsonDecode(response.body);
  }
}`;

  const kotlinClientCode = `// SaburovApiClient.kt (Android Kotlin + Retrofit)
package uz.saburov.api

import retrofit2.Response
import retrofit2.http.*

interface SaburovApiService {
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @GET("auth/me")
    suspend fun getMe(@Header("Authorization") token: String): Response<UserResponse>

    @GET("chats")
    suspend fun getChats(@Header("Authorization") token: String): Response<ChatListResponse>

    @GET("chats/{chatId}/messages")
    suspend fun getMessages(
        @Header("Authorization") token: String,
        @Path("chatId") chatId: String
    ): Response<MessageListResponse>

    @POST("chats/{chatId}/messages")
    suspend fun sendMessage(
        @Header("Authorization") token: String,
        @Path("chatId") chatId: String,
        @Body messageBody: SendMessageRequest
    ): Response<SendMessageResponse>

    @POST("data/sync")
    suspend fun syncOffline(
        @Header("Authorization") token: String,
        @Body syncBody: SyncRequest
    ): Response<SyncResponse>
}`;

  const swiftClientCode = `// SaburovApi.swift (iOS Swift)
import Foundation

class SaburovApi {
    static let shared = SaburovApi()
    let baseUrl = "https://api.saburov.uz/api/v1"
    private var token: String?

    func login(username: String, password: String) async throws -> String {
        guard let url = URL(string: "\\(baseUrl)/auth/login") else { throw URLError(.badURL) }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["username": username, "password": password]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, _) = try await URLSession.shared.data(for: request)
        if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
           let token = json["token"] as? String {
            self.token = token
            return token
        }
        throw NSError(domain: "AuthError", code: 401)
    }
}`;

  const reactNativeCode = `// api/saburovClient.ts (React Native)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saburovApi = axios.create({
  baseURL: 'https://api.saburov.uz/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

saburovApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('user_jwt_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hero */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 sm:p-6 text-white shadow-md">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>MOBILE SDK ARCHITECTURE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-white">
          Mobil Ilova (Flutter, Android, iOS) Integratsiya Arxitekturasi
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
          api.saburov.uz servisi mobil ilovalar uchun maxsus optimallashtirilgan: JWT avtorizatsiya, oflayn kesh sinxronizatsiyasi, tezkor xabar almashinuvi va past tarmoq sarfi.
        </p>
      </div>

      {/* 4 Core Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 sm:p-5 space-y-2.5 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">1. Xavfsiz JWT Saqlash</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            JWT tokenni <code className="text-indigo-300">FlutterSecureStorage</code> yoki Android <code className="text-indigo-300">EncryptedSharedPreferences</code>da saqlang. <code className="text-indigo-300">Authorization: Bearer &lt;token&gt;</code> headerini barcha so'rovlarga qo'shing.
          </p>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 sm:p-5 space-y-2.5 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">2. Real-vaqt Xabarlar</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mobil ilovada <code className="text-emerald-300">/api/v1/chats/:id/messages</code> orqali 3-5 soniyali polling yoki WebSocket/SSE oqimi yordamida xabarlarni uzluksiz sinxronlash mumkin.
          </p>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 sm:p-5 space-y-2.5 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">3. Oflayn Delta Sync</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tarmoq yo'qolganda xabarlarni mahalliy SQLite/Hive bazasida saqlab, internet paydo bo'lganda <code className="text-amber-300">/api/v1/data/sync</code> endpointi orqali to'liq sinxronlang.
          </p>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 sm:p-5 space-y-2.5 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">4. JSON Data Payloads</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Foydalanuvchilar o'rtasida shunchaki matn emas, balki istalgan murakkab JSON ma'lumotlar paketi (IoT, grafikalar, joylashuv) almashish mumkin.
          </p>
        </div>
      </div>

      {/* Code Snippet Switcher */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-3.5">
          <div>
            <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>Tayyor Mobil API Mijoz Kodi (Ready-to-use Client Class)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ilovangizga to'g'ridan-to'g'ri nusxalab joylashtirishingiz mumkin bo'lgan to'liq sinf.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#0F172A] p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('flutter')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'flutter' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Flutter (Dart)
              </button>
              <button
                onClick={() => setActiveTab('kotlin')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'kotlin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Android (Kotlin)
              </button>
              <button
                onClick={() => setActiveTab('swift')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'swift' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                iOS (Swift)
              </button>
              <button
                onClick={() => setActiveTab('reactnative')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'reactnative' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                React Native
              </button>
            </div>

            <button
              onClick={() => {
                const code =
                  activeTab === 'flutter'
                    ? flutterClientCode
                    : activeTab === 'kotlin'
                    ? kotlinClientCode
                    : activeTab === 'swift'
                    ? swiftClientCode
                    : reactNativeCode;
                handleCopy(code, 'mobile-code');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded text-xs font-medium transition-colors"
            >
              {copiedKey === 'mobile-code' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Nusxalash</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-4 font-mono text-xs text-indigo-300 overflow-x-auto max-h-[500px] leading-relaxed">
          <pre className="whitespace-pre">
            {activeTab === 'flutter' && flutterClientCode}
            {activeTab === 'kotlin' && kotlinClientCode}
            {activeTab === 'swift' && swiftClientCode}
            {activeTab === 'reactnative' && reactNativeCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
