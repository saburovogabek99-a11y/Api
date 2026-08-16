import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Database,
  Users,
  MessageSquare,
  HardDrive,
  Cpu,
} from 'lucide-react';

export const LiveMonitor: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchTelemetry = () => {
    fetch('/api/v1/logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch((e) => console.error(e));

    fetch('/api/v1/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((e) => console.error(e));

    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchTelemetry();
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(fetchTelemetry, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>REAL-TIME SYSTEM TELEMETRY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Server Metriklari & API Trafik Loglari
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            api.saburov.uz Node.js Express serveriga tushayotgan har bir HTTP so'rovi va uning javob vaqti (latency).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-[#0F172A] px-3 py-1.5 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
            />
            <span className="font-mono text-xs">Avto-yangilanish (3s)</span>
          </label>

          <button
            onClick={fetchTelemetry}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Qayta yuklash"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Foydalanuvchilar</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.totalUsers || 4}
            <span className="text-xs font-normal text-emerald-400 ml-2 font-mono">
              ({stats?.onlineUsers || 2} onlayn)
            </span>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Jami Xabarlar</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.totalMessages || 5}</div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Ulashilgan Data</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.totalSharedData || 3}</div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Server Uptime</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {health?.uptimeSeconds ? `${Math.round(health.uptimeSeconds)} s` : 'Faol'}
          </div>
        </div>
      </div>

      {/* Live Logs Table */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span>So'nggi So'rovlar Logi ({logs.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">REAL-TIME HTTP STREAM</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-[#0F172A] text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Vaqt</th>
                <th className="py-2.5 px-3">Metod</th>
                <th className="py-2.5 px-3">Yo'l (Path)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">User-Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    Hozircha loglar mavjud emas. Sandbox orqali biror so'rov yuboring!
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0F172A]/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'GET'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.method === 'POST'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            : log.method === 'PATCH' || log.method === 'PUT'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-semibold whitespace-nowrap">
                      {log.path}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status >= 200 && log.status < 300
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-indigo-300 whitespace-nowrap">
                      {log.durationMs} ms
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs text-[11px]">
                      {log.userAgent}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
