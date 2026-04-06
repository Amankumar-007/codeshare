import React from 'react';
import { Code2, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'json', label: 'JSON' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'rust', label: 'Rust' },
  { id: 'java', label: 'Java' },
  { id: 'php', label: 'PHP' },
  { id: 'sql', label: 'SQL' },
];

export default function LangSelector({ current, onChange }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm transition-colors border border-gray-700/50"
      >
        <Code2 className="w-4 h-4 text-purple-400" />
        <span className="capitalize">{LANGUAGES.find(l => l.id === current)?.label || current}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-48 bg-[#161b22] border border-gray-700 rounded-xl shadow-2xl z-50 py-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                onChange(lang.id);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-600 transition-colors ${
                current === lang.id ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-gray-300'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
