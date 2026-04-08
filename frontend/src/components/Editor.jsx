import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, Decoration, ViewPlugin, MatchDecorator, showTooltip, hoverTooltip } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { rust } from '@codemirror/lang-rust';
import { java } from '@codemirror/lang-java';
import { php } from '@codemirror/lang-php';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/plugins/babel';
import parserEstree from 'prettier/plugins/estree';
import parserHtml from 'prettier/plugins/html';
import parserCss from 'prettier/plugins/postcss';

// URL detection regex
const URL_REGEX = /(https?:\/\/[^\s\n\r\t<>"]+)/g;

// Create the link highlight extension
const linkDecorator = new MatchDecorator({
  regexp: URL_REGEX,
  decoration: Decoration.mark({
    class: 'cm-link',
    attributes: { title: 'Click to open link' }
  })
});

const linkTooltip = (view, pos, side) => {
  const line = view.state.doc.lineAt(pos);
  const text = line.text;
  const offsetInLine = pos - line.from;

  let match;
  URL_REGEX.lastIndex = 0;
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (offsetInLine >= match.index && offsetInLine <= match.index + match[0].length) {
      return {
        pos: line.from + match.index,
        end: line.from + match.index + match[0].length,
        above: true,
        create(view) {
          const dom = document.createElement('div');
          dom.className = 'cm-link-tooltip';
          dom.innerHTML = `
            <div class="flex items-center gap-2 px-2 py-1 bg-[#1c2128] border border-zinc-700 rounded-md shadow-xl text-[11px] text-zinc-300">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              <span class="font-bold opacity-70">External Link:</span>
              <span class="truncate max-w-[200px] text-blue-400 font-mono">${match[0]}</span>
            </div>
          `;
          return { dom };
        }
      };
    }
  }
  return null;
};

const linkPlugin = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorator = linkDecorator;
    this.decorations = this.decorator.createDeco(view);
  }
  update(update) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.decorator.updateDeco(update, this.decorations);
    }
  }
}, {
  decorations: v => v.decorations,
  eventHandlers: {
    mousedown: (e, view) => {
      if (e.button !== 0) return;

      // Use closest to find the .cm-link element even if the click was slightly off or on a child
      const linkEl = e.target.closest('.cm-link');
      if (linkEl) {
        const url = linkEl.textContent;
        if (url) {
          // Open in a new tab
          const win = window.open(url, '_blank', 'noopener,noreferrer');
          if (win) win.focus();
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  }
});

const languageMap = {
  javascript: javascript({ jsx: true }),
  typescript: javascript({ jsx: true, typescript: true }),
  python: python(),
  cpp: cpp(),
  html: html(),
  css: css(),
  json: json(),
  markdown: markdown(),
  rust: rust(),
  java: java(),
  php: php(),
  sql: sql(),
};

const parserMap = {
  javascript: { parser: 'babel', plugins: [parserBabel, parserEstree] },
  html: { parser: 'html', plugins: [parserHtml] },
  css: { parser: 'css', plugins: [parserCss] },
  json: { parser: 'json', plugins: [parserBabel, parserEstree] },
};

export default function Editor({ value, onChange, language = 'javascript' }) {
  const extension = useMemo(() => languageMap[language] || javascript({ jsx: true }), [language]);

  const formatCode = async () => {
    const config = parserMap[language];
    if (!config) return;
    try {
      const formatted = await prettier.format(value, config);
      onChange(formatted);
    } catch (err) {
      console.error('Format failed:', err);
    }
  };

  return (
    <div className="relative group h-full editor-container">
      <CodeMirror
        value={value}
        height="calc(100vh - 110px)"
        theme={oneDark}
        extensions={[extension, linkPlugin, hoverTooltip(linkTooltip)]}
        onChange={(val) => onChange(val)}
        className="text-lg"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
        }}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            formatCode();
          }
        }}
      />
      <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800/80 px-3 py-1 rounded text-[10px] text-gray-400 font-mono pointer-events-none border border-gray-700">
        Ctrl + Shift + F to format
      </div>
    </div>
  );
}
