import React from 'react';
import { Terminal, Eye, X, Maximize2, ExternalLink } from 'lucide-react';

export default function OutputPanel({ type, content, output, isRunning, onClose }) {
  const isWeb = ['html', 'css', 'javascript'].includes(type);

  // Generate HTML for web preview
  const generateHTML = () => {
    if (type === 'html') return content;
    if (type === 'css') return `<style>${content}</style>`;
    if (type === 'javascript') return `<script>${content}</script>`;
    return '';
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-l border-gray-800 shadow-2xl relative">
      <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-[#161b22]">
        <div className="flex items-center gap-2">
          {isWeb ? <Eye className="w-4 h-4 text-blue-400" /> : <Terminal className="w-4 h-4 text-green-400" />}
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {isWeb ? 'Live Preview' : 'Console Output'}
          </span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-500">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {isRunning && (
          <div className="absolute inset-0 bg-[#0d1117]/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-xs font-medium text-blue-400 animate-pulse">Running...</span>
            </div>
          </div>
        )}

        {isWeb ? (
          <iframe 
            srcDoc={generateHTML()}
            title="web-preview"
            sandbox="allow-scripts"
            className="w-full h-full bg-white border-none shadow-inner"
          />
        ) : (
          <div className="h-full bg-[#0d1117] p-6 font-mono text-[13px] overflow-auto select-text leading-relaxed">
            {output ? (
              <pre className={`whitespace-pre-wrap ${output.stderr ? 'text-red-400' : 'text-gray-300'}`}>
                {output.stdout || output.output || output.stderr}
              </pre>
            ) : (
              <span className="text-gray-600 italic">Click "Run" to see the output...</span>
            )}
            {output?.code !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-800 text-[10px] text-gray-500">
                Process finished with exit code {output.code}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
