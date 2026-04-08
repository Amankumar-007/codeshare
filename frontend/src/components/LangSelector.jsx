import React from 'react';
import { Code2, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', color: 'text-yellow-400' },
  { id: 'typescript', label: 'TypeScript', color: 'text-blue-400' },
  { id: 'python', label: 'Python', color: 'text-blue-500' },
  { id: 'cpp', label: 'C++', color: 'text-purple-400' },
  { id: 'go', label: 'Go', color: 'text-cyan-400' },
  { id: 'rust', label: 'Rust', color: 'text-orange-500' },
  { id: 'java', label: 'Java', color: 'text-red-400' },
  { id: 'php', label: 'PHP', color: 'text-indigo-400' },
  { id: 'ruby', label: 'Ruby', color: 'text-red-500' },
  { id: 'csharp', label: 'C#', color: 'text-purple-500' },
  { id: 'html', label: 'HTML', color: 'text-orange-500' },
  { id: 'css', label: 'CSS', color: 'text-blue-400' },
  { id: 'sql', label: 'SQL', color: 'text-green-400' },
  { id: 'json', label: 'JSON', color: 'text-yellow-500' },
  { id: 'markdown', label: 'Markdown', color: 'text-gray-400' },
  { id: 'text', label: 'Plain Text', color: 'text-gray-500' },
];

export default function LangSelector({ current, onChange }) {
  const [open, setOpen] = React.useState(false);

  const currentLang = LANGUAGES.find(l => l.id === current);

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm transition-all border border-gray-700/50 hover:border-blue-500/30 group"
      >
        <span className={`${currentLang?.color || 'text-purple-400'} transition-colors group-hover:scale-110`}>
          <Code2 className="w-4 h-4" />
        </span>
        <span className="capitalize font-medium">{currentLang?.label || current}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-52 bg-[#0d1117] border border-gray-800 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 pb-2 mb-2 border-b border-gray-800/50">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Environment</span>
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                onChange(lang.id);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center gap-3 hover:bg-gray-800 ${
                current === lang.id ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${lang.color?.replace('text-', 'bg-')}`} />
              <span className="flex-1">{lang.label}</span>
              {current === lang.id && <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
