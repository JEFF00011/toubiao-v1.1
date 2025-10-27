import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="border-2 border-neutral-300 rounded-lg bg-white shadow-sm hover:border-primary-400 focus-within:border-primary-500 transition-colors">
      <div className="flex items-center gap-1 p-2 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100 flex-wrap rounded-t-lg">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 hover:bg-primary-100 hover:text-primary-700 rounded transition-all active:scale-95"
          title="粗体 (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 hover:bg-primary-100 hover:text-primary-700 rounded transition-all active:scale-95"
          title="斜体 (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-1.5 hover:bg-primary-100 hover:text-primary-700 rounded transition-all active:scale-95"
          title="下划线 (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1.5 hover:bg-primary-100 hover:text-primary-700 rounded transition-all active:scale-95"
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-1.5 hover:bg-primary-100 hover:text-primary-700 rounded transition-all active:scale-95"
          title="有序列表"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="p-1.5 hover:bg-primary-100 hover:text-primary-700 rounded transition-all active:scale-95"
          title="左对齐"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="p-1.5 hover:bg-primary-100 hover:text-primary-700 rounded transition-all active:scale-95"
          title="居中对齐"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="p-1.5 hover:bg-primary-100 hover:text-primary-700 rounded transition-all active:scale-95"
          title="右对齐"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-neutral-300 mx-1" />

        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="px-3 py-1.5 text-xs border border-neutral-300 rounded hover:bg-white hover:border-primary-400 transition-colors cursor-pointer"
          defaultValue=""
        >
          <option value="">正文</option>
          <option value="h1">标题 1</option>
          <option value="h2">标题 2</option>
          <option value="h3">标题 3</option>
        </select>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="min-h-[200px] max-h-[500px] overflow-y-auto p-4 text-sm focus:outline-none"
        data-placeholder={placeholder}
        style={{
          whiteSpace: 'pre-wrap',
        }}
      />
    </div>
  );
};
