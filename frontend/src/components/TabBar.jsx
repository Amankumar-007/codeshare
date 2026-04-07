import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, FileCode, Hash, FileJson, FileText, Layout, ChevronLeft, ChevronRight } from 'lucide-react';

const getFileIcon = (lang) => {
  switch (lang) {
    case 'javascript': return <FileCode className="w-4 h-4 text-yellow-400" />;
    case 'html': return <Layout className="w-4 h-4 text-orange-500" />;
    case 'css': return <Hash className="w-4 h-4 text-blue-400" />;
    case 'json': return <FileJson className="w-4 h-4 text-yellow-500" />;
    case 'python': return <FileCode className="w-4 h-4 text-blue-500" />;
    default: return <FileText className="w-4 h-4 text-gray-400" />;
  }
};

export default function TabBar({ tabs, activeTabId, onTabSelect, onTabAdd, onTabClose, onTabRename }) {
  const [editingTabId, setEditingTabId] = useState(null);
  const [tempName, setTempName] = useState('');
  const scrollRef = useRef(null);

  const handleRename = (id, newName) => {
    if (newName.trim()) {
      onTabRename(id, newName.trim());
    }
    setEditingTabId(null);
  };

  const scroll = (dir) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.5;
      scrollRef.current.scrollTo({
        left: dir === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex items-center bg-[#161b22] border-b border-gray-800 group/tabbar">
      {/* Scroll Controls (visible on hover if overflowing) */}
      <div className="flex-1 overflow-x-auto no-scrollbar flex items-center" ref={scrollRef}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            onDoubleClick={(e) => {
              setEditingTabId(tab.id);
              setTempName(tab.name);
            }}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 min-w-[120px] max-w-[200px] 
              cursor-pointer border-r border-gray-800 transition-all duration-200
              ${activeTabId === tab.id ? 'bg-[#0d1117] text-white' : 'text-gray-400 hover:bg-[#1f242c] hover:text-gray-300'}
            `}
          >
            {activeTabId === tab.id && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500 animate-in slide-in-from-top duration-300" />
            )}
            
            <div className="flex-shrink-0 animate-in zoom-in duration-300">
              {getFileIcon(tab.language)}
            </div>

            {editingTabId === tab.id ? (
              <input
                autoFocus
                className="bg-transparent border-none outline-none text-sm w-full focus:ring-1 focus:ring-blue-500/50 rounded px-1"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => handleRename(tab.id, tempName)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(tab.id, tempName);
                  if (e.key === 'Escape') setEditingTabId(null);
                }}
              />
            ) : (
              <span className="text-xs font-medium truncate select-none">{tab.name}</span>
            )}

            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className={`
                  p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-700/50 transition-all
                  ${activeTabId === tab.id ? 'opacity-100' : ''}
                `}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={onTabAdd}
          className="p-3 text-gray-500 hover:text-white hover:bg-[#1f242c] transition-all flex-shrink-0"
          title="New Tab (Ctrl+M)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center px-1 border-l border-gray-800">
         <button onClick={() => scroll('left')} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700/30 rounded-md">
            <ChevronLeft className="w-4 h-4" />
         </button>
         <button onClick={() => scroll('right')} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700/30 rounded-md">
            <ChevronRight className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}
