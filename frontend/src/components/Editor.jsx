import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
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

const languageMap = {
  javascript: javascript({ jsx: true }),
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
  const extension = languageMap[language] || javascript({ jsx: true });

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
    <div className="relative group h-full">
      <CodeMirror
        value={value}
        height="calc(101vh - 110px)"
        theme={oneDark}
        extensions={[extension]}
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
