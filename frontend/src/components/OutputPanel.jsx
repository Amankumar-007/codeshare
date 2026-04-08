import React, { useState, useEffect } from 'react';
import { Terminal, Eye, X, Maximize2, Trash2, Copy, Check, ChevronRight, Hash } from 'lucide-react';

export default function OutputPanel({ type, content, output, isRunning, onClose, onClear }) {
  const [copied, setCopied] = useState(false);
  const isWeb = ['html'].includes(type); // Only HTML uses the iframe preview now

  const copyOutput = () => {
    const text = output?.stdout || output?.output || output?.stderr || '';
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getShellPrompt = () => {
    const map = {
      javascript: 'node',
      typescript: 'ts-node',
      python: 'python3',
      cpp: 'g++',
      rust: 'cargo run',
      java: 'javac',
      go: 'go run',
      php: 'php',
      ruby: 'ruby',
      csharp: 'dotnet run'
    };
    return map[type] || 'run';
  };

  // Generate HTML for web preview
  const generateHTML = () => {
    if (type === 'html') return content;
    return '';
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-l border-zinc-800 shadow-2xl relative overflow-hidden">
      {/* Terminal Header */}
      <div className="h-12 border-b border-zinc-800/50 flex items-center justify-between px-4 bg-[#0d1117]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-zinc-800 mx-1" />
          <div className="flex items-center gap-2">
            {isWeb ? (
              <Eye className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {isWeb ? 'Live Preview' : 'Debug Console'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isWeb && (
            <>
              {output && (
                <button 
                  onClick={copyOutput}
                  className="p-1.5 hover:bg-zinc-800/50 rounded-md transition-all text-zinc-500 hover:text-zinc-300 group"
                  title="Copy Output"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 group-hover:scale-110" />}
                </button>
              )}
              <button 
                onClick={onClear}
                className="p-1.5 hover:bg-zinc-800/50 rounded-md transition-all text-zinc-500 hover:text-red-400 group"
                title="Clear Console"
              >
                <Trash2 className="w-3.5 h-3.5 group-hover:rotate-12" />
              </button>
            </>
          )}
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-red-500/10 rounded-md transition-all text-zinc-500 hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col min-h-0 bg-[#0d1117]">
        {isRunning && (
          <div className="absolute inset-0 bg-[#0d1117]/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500/10 border-b-blue-500 rounded-full animate-spin-slow"></div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-[0.2em] animate-pulse">
              Executing {type}...
            </span>
          </div>
        )}

        {isWeb ? (
          <div className="w-full h-full bg-white relative">
            <iframe 
              srcDoc={generateHTML()}
              title="web-preview"
              sandbox="allow-scripts"
              className="w-full h-full border-none"
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-0 font-mono text-[13px] terminal-scrollbar custom-terminal">
            <div className="min-h-full flex flex-col p-6 pt-4">
              {/* Terminal Welcome Message */}
              {!output && !isRunning && (
                <div className="flex flex-col gap-2 mt-2 opacity-40">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <ChevronRight className="w-4 h-4" />
                    <span>Ready for execution</span>
                  </div>
                  <div className="text-[11px] text-zinc-600 ml-6">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">Enter</kbd> to run code
                  </div>
                </div>
              )}

              {output && (
                <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300">
                  {/* Command line preview */}
                  <div className="flex items-start gap-2 text-emerald-400/90 font-bold text-[12px] opacity-80 mb-2">
                    <span className="text-blue-400">visitor@snippetx:~$</span>
                    <span>{getShellPrompt()} script.{type === 'javascript' ? 'js' : type === 'python' ? 'py' : type}</span>
                  </div>

                  <pre 
                    className={`whitespace-pre-wrap leading-relaxed break-words ${output.stderr ? 'text-red-400 bg-red-500/5 p-4 rounded-lg border border-red-500/10' : 'text-zinc-300'}`}
                    dangerouslySetInnerHTML={{
                      __html: (output.stdout || output.output || output.stderr || '')
                        .toString()
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;')
                        .replace(/(https?:\/\/[^\s\n\r\t<>"]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300 transition-colors">$1</a>')
                    }}
                  />

                  {output.code !== undefined && (
                    <div className="mt-8 flex items-center gap-3">
                      <div className={`h-1.5 w-1.5 rounded-full ${output.code === 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                        Process finished with exit code {output.code}
                      </span>
                      <div className="h-px w-full bg-zinc-800/50" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .custom-terminal {
          background-image: 
            radial-gradient(circle at top right, rgba(16, 185, 129, 0.03) 0%, transparent 40%),
            radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.03) 0%, transparent 40%);
        }
        .terminal-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .terminal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .terminal-scrollbar::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 4px;
        }
        .terminal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>
    </div>
  );
}
