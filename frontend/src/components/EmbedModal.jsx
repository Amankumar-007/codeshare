import React from 'react';
import { Copy, X, Code, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmbedModal({ id, isOpen, onClose }) {
  const embedCode = `<iframe 
  src="${window.location.origin}/embed/${id}" 
  width="100%" height="400" 
  style="border:1px solid #30363d; border-radius:12px;" 
  title="Shared Code from TextDrop"
></iframe>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied!');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#0d1117]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-[#161b22] border border-gray-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 flex items-center gap-3">
            <Code className="w-6 h-6 text-blue-400" />
            Embed Snippet
          </h2>

          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Copy the code below to embed this code block on your website or blog. The VS Code theme will be preserved!
          </p>

          <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-4 mb-8 font-mono text-xs text-blue-400/80 overflow-x-auto whitespace-pre leading-relaxed">
            {embedCode}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={copyCode}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </button>
            <a 
              href={`/embed/${id}`} 
              target="_blank" 
              className="flex-1 border border-gray-800 py-3 rounded-xl font-bold text-gray-400 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
