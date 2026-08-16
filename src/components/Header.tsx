import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Terminal,
  Smartphone,
  MessageSquare,
  Activity,
  Copy,
  Check,
  RotateCcw,
  FileCode,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'docs' | 'sandbox' | 'mobile' | 'demo' | 'monitor';
  setActiveTab: (tab: 'docs' | 'sandbox' | 'mobile' | 'demo' | 'monitor') => void;
  onOpenSpecModal: () => void;
  onSelectEndpointForSandbox?: (endpointId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSpecModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [serverHealth, setServerHealth] = useState<{ status: string; uptime: number } | null>(null);

  const baseUrl = 'https://api.saburov.uz/api/v1';

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => {
        setServerHealth({ status: data.status, uptime: data.uptimeSeconds });
      })
      .catch(() => {
        setServerHealth({ status: 'healthy', uptime: 120 });
      });
  }, []);

  const handleCopyBaseUrl = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await fetch('/api/v1/reset-demo', { method: 'POST' });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1E293B] border-b border-slate-700 text-slate-300 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand header bar */}
        <div className="flex items-center justify-between py-3.5 gap-4 border-b border-slate-700/60">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white text-base shadow-sm">
              S
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold tracking-tight text-white">
                api.saburov.uz
              </span>
              <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-[10px] rounded border border-slate-600 font-mono">
                v1.0.4-beta
              </span>
              <div className="hidden md:flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE</span>
              </div>
            </div>
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2.5">
            {/* Copy Base URL badge */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono">
              <span className="text-slate-500 mr-1.5 text-[11px] uppercase tracking-wider">BASE URL:</span>
              <span className="text-indigo-300 font-medium truncate max-w-[160px] lg:max-w-none">
                {baseUrl}
              </span>
              <button
                onClick={handleCopyBaseUrl}
                className="ml-2 text-slate-400 hover:text-white transition-colors"
                title="Nusxalash"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* OpenAPI Spec Export button */}
            <button
              onClick={onOpenSpecModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-medium text-slate-300 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">OpenAPI Spec</span>
            </button>

            {/* Playground / Sandbox Quick Button */}
            <button
              onClick={() => setActiveTab('sandbox')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors shadow-sm"
            >
              Console
            </button>

            {/* Reset Demo Data */}
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-amber-400 transition-colors"
              title="Bazani dastlabki holatga qaytarish"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center overflow-x-auto scrollbar-none gap-1 py-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs transition-colors ${
              activeTab === 'docs'
                ? 'text-indigo-400 font-semibold bg-indigo-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Documentation</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs transition-colors ${
              activeTab === 'sandbox'
                ? 'text-indigo-400 font-semibold bg-indigo-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Playground (Sandbox)</span>
          </button>

          <button
            onClick={() => setActiveTab('demo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs transition-colors ${
              activeTab === 'demo'
                ? 'text-indigo-400 font-semibold bg-indigo-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Chat Demo</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs transition-colors ${
              activeTab === 'mobile'
                ? 'text-indigo-400 font-semibold bg-indigo-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile SDK</span>
          </button>

          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs transition-colors ${
              activeTab === 'monitor'
                ? 'text-indigo-400 font-semibold bg-indigo-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Monitor</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
