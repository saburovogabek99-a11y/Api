import React, { useState } from 'react';
import { Header } from './components/Header';
import { SwaggerDocs } from './components/SwaggerDocs';
import { ApiSandbox } from './components/ApiSandbox';
import { QuickMessengerDemo } from './components/QuickMessengerDemo';
import { MobileSdkGuide } from './components/MobileSdkGuide';
import { LiveMonitor } from './components/LiveMonitor';
import { SpecModal } from './components/SpecModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'docs' | 'sandbox' | 'mobile' | 'demo' | 'monitor'>('docs');
  const [selectedEndpointForSandbox, setSelectedEndpointForSandbox] = useState<string>('auth-login');
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);

  const handleSelectEndpointForSandbox = (endpointId: string) => {
    setSelectedEndpointForSandbox(endpointId);
    setActiveTab('sandbox');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header with Navigation & Live Status */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSpecModal={() => setIsSpecModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'docs' && (
          <SwaggerDocs onSelectEndpointForSandbox={handleSelectEndpointForSandbox} />
        )}

        {activeTab === 'sandbox' && (
          <ApiSandbox initialEndpointId={selectedEndpointForSandbox} />
        )}

        {activeTab === 'demo' && <QuickMessengerDemo />}

        {activeTab === 'mobile' && <MobileSdkGuide />}

        {activeTab === 'monitor' && <LiveMonitor />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0B1120] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300 font-mono">api.saburov.uz</span>
            <span>•</span>
            <span>Node.js REST API & Real-time Messaging Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-xs">
            <button
              onClick={() => setIsSpecModalOpen(true)}
              className="hover:text-indigo-400 transition-colors"
            >
              OpenAPI 3.1 Spec
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('mobile')}
              className="hover:text-indigo-400 transition-colors"
            >
              Mobile SDK Docs
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('sandbox')}
              className="hover:text-indigo-400 transition-colors"
            >
              Sandbox Console
            </button>
          </div>
        </div>
      </footer>

      {/* OpenAPI Spec Modal */}
      <SpecModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />
    </div>
  );
}
