import React, { useState, useEffect } from 'react';
import { FileCode, Copy, Check, Download, ExternalLink } from 'lucide-react';

interface SpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecModal: React.FC<SpecModalProps> = ({ isOpen, onClose }) => {
  const [specJson, setSpecJson] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [format, setFormat] = useState<'json' | 'yaml'>('json');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/v1/openapi.json')
        .then((res) => res.json())
        .then((data) => {
          setSpecJson(JSON.stringify(data, null, 2));
        })
        .catch((e) => console.error(e));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(specJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([specJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api.saburov.uz-openapi.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl max-w-4xl w-full p-6 text-white space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">OpenAPI 3.1 Schema Spetsifikatsiyasi</h3>
              <p className="text-xs text-slate-400">
                Swagger Editor, Postman, Insomnia yoki OpenAPI Generator bilan import qiling
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Nusxalash</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Yuklab olish (.json)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 text-sm ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* JSON Code Box */}
        <div className="flex-1 bg-[#0F172A] border border-slate-800 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-auto">
          <pre>{specJson || 'Yuklanmoqda...'}</pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700">
          <span>URL: <code className="text-indigo-400 font-mono">https://api.saburov.uz/api/v1/openapi.json</code></span>
          <a
            href="https://editor.swagger.io"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-mono text-xs"
          >
            <span>Swagger Editor da ochish</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
