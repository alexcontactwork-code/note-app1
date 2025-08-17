import React, { useRef, useState, useEffect } from 'react';
import { Note } from '../types';
import { Trash, CheckSquare, Table as TableIcon, TextIncrease, TextDecrease, PlusSquare, Notebook, Download } from './Icons';
import { useDebounce } from './useDebounce';
import TableComponent from './Table';

interface EditorProps {
  activeNote: Note | undefined;
  onUpdateNote: (updatedFields: Partial<Omit<Note, 'id' | 'lastModified'>>) => void;
  onDeleteNote: () => void;
}

const DEBOUNCE_DELAY = 500;
const FONT_SIZE_STEP = 2;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 28;

const Editor: React.FC<EditorProps> = ({ activeNote, onUpdateNote, onDeleteNote }) => {
  const [title, setTitle] = useState(activeNote?.title || '');
  const [content, setContent] = useState(activeNote?.content || '');
  const [table, setTable] = useState(activeNote?.table);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const debouncedTitle = useDebounce(title, DEBOUNCE_DELAY);
  const debouncedContent = useDebounce(content, DEBOUNCE_DELAY);
  const debouncedTable = useDebounce(table, DEBOUNCE_DELAY);

  useEffect(() => {
    onUpdateNote({ title: debouncedTitle });
  }, [debouncedTitle]);

  useEffect(() => {
    onUpdateNote({ content: debouncedContent });
  }, [debouncedContent]);
  
  useEffect(() => {
    onUpdateNote({ table: debouncedTable });
  }, [debouncedTable]);

  // Reset local state when the active note changes
  useEffect(() => {
    const newContent = activeNote?.content || '';
    setTitle(activeNote?.title || '');
    setContent(newContent);
    setTable(activeNote?.table);

    if (editorRef.current && editorRef.current.innerHTML !== newContent) {
        editorRef.current.innerHTML = newContent;
    }
  }, [activeNote]);
  
  const handleExportNote = () => {
    if (!activeNote) return;

    // Convert HTML content to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = activeNote.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    const fileContent = `${activeNote.title}\n\n${textContent}`;
    
    // Sanitize title for filename
    const fileName = `${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 dark:text-zinc-400 animate-fade-in p-8 select-none">
        <Notebook className="w-24 h-24 text-zinc-300 dark:text-zinc-700 mb-6" />
        <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">Welcome to Laptop Notes</h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-sm">
          To get started, click the <PlusSquare className="inline-block w-5 h-5 align-middle -mt-1 text-yellow-500" /> button above to create your first note.
        </p>
         <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Or select an existing note from the list on the left.
        </p>
        <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full">
            ✨ Tip: All your notes are saved automatically as you type!
        </p>
      </div>
    );
  }

  const formattedDate = new Date(activeNote.lastModified).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  const handleCreateTable = () => {
    if (!table) {
      setTable([
        ['Header 1', 'Header 2', 'Header 3'],
        ['', '', ''],
        ['', '', ''],
      ]);
    }
  };
  
  const handleTableChange = (newData: string[][] | null) => {
    if (newData === null) {
      setTable(undefined);
    } else {
      setTable(newData);
    }
  };

  const handleInsertChecklist = () => {
    document.execCommand('insertHTML', false, '<div>- [ ]&nbsp;</div>');
    if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
    }
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount || selection.isCollapsed === false) return;

      const range = selection.getRangeAt(0);
      const container = range.startContainer;
      
      if (container.nodeType === Node.TEXT_NODE && container.textContent) {
        const text = container.textContent;
        const checkPattern = /^(\s*-\s*)(\[([ x])\])\s?/;
        const match = text.match(checkPattern);
        
        if (match) {
            const checkboxEndOffset = match[1].length + match[2].length;
            if (range.startOffset <= checkboxEndOffset) {
                const isChecked = match[3] === 'x';
                container.textContent = text.replace(match[2], isChecked ? '[ ]' : '[x]');
                
                if (editorRef.current) {
                    setContent(editorRef.current.innerHTML);
                }
            }
        }
    }
  };

  const applyFontSize = (adjustment: number) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const startElement = (range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer) as HTMLElement;
    const currentSize = parseFloat(window.getComputedStyle(startElement).fontSize) || 16;
    const baseNewSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, currentSize + adjustment));

    const fragment = range.extractContents();
    
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '') {
        const span = document.createElement('span');
        span.style.fontSize = `${baseNewSize}px`;
        span.appendChild(node.cloneNode());
        return span;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.nodeName === 'SPAN' && el.style.fontSize) {
          const currentSize = parseFloat(el.style.fontSize) || 16;
          const newSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, currentSize + adjustment));
          el.style.fontSize = `${newSize}px`;
        }
        Array.from(el.childNodes).forEach(child => {
            const processedChild = processNode(child);
            if (processedChild !== child) {
                el.replaceChild(processedChild, child);
            }
        });
      }
      return node;
    };

    Array.from(fragment.childNodes).forEach(child => {
        const processedChild = processNode(child);
        if (processedChild !== child) {
            fragment.replaceChild(processedChild, child);
        }
    });

    range.insertNode(fragment);

    // Restore selection
    selection.removeAllRanges();
    selection.addRange(range);

    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleIncreaseFontSize = () => applyFontSize(FONT_SIZE_STEP);
  const handleDecreaseFontSize = () => applyFontSize(-FONT_SIZE_STEP);
  
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
  };
  
  const EditorButton = ({ onMouseDown, onClick, title, children }: { onMouseDown?: (e: React.MouseEvent) => void; onClick?: () => void; title: string; children: React.ReactNode; }) => (
     <button 
        onMouseDown={onMouseDown} 
        onClick={onClick}
        className="group p-1 text-zinc-500 dark:text-zinc-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all duration-200 ease-in-out hover:scale-125 active:scale-95 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
        title={title}
        aria-label={title}
      >
          <div className="group-hover:animate-jiggle">{children}</div>
      </button>
  );

  const handleFormattingMouseDown = (e: React.MouseEvent, action: () => void) => {
      e.preventDefault();
      action();
  };

  return (
    <div className="flex-1 flex flex-col h-full animate-fade-in">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-sm text-zinc-500 dark:text-zinc-400">
        <span className="font-medium">{formattedDate}</span>
        <div className="flex items-center gap-2">
            <EditorButton onMouseDown={(e) => handleFormattingMouseDown(e, handleInsertChecklist)} title="Insert Checklist Item">
                <CheckSquare className="w-5 h-5" />
            </EditorButton>
            <EditorButton onClick={handleCreateTable} title="Insert Table">
                <TableIcon className="w-5 h-5" />
            </EditorButton>
            <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
            <EditorButton onMouseDown={(e) => handleFormattingMouseDown(e, handleDecreaseFontSize)} title="Decrease font size">
                <TextDecrease className="w-5 h-5" />
            </EditorButton>
            <span className="text-xs font-mono w-10 text-center select-none" aria-label={`Base font size`}>Aa</span>
            <EditorButton onMouseDown={(e) => handleFormattingMouseDown(e, handleIncreaseFontSize)} title="Increase font size">
                <TextIncrease className="w-5 h-5" />
            </EditorButton>
            <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
            <EditorButton onClick={handleExportNote} title="Save as TXT">
                <Download className="w-5 h-5" />
            </EditorButton>
            <EditorButton onClick={onDeleteNote} title="Delete Note">
                <Trash className="w-5 h-5" />
            </EditorButton>
        </div>
      </div>
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-8 lg:px-12 py-8 overflow-y-auto">
        <div className="relative group">
          <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl md:text-4xl font-bold bg-transparent focus:outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400/80 dark:placeholder:text-zinc-500/80 mb-6 border-b-2 border-transparent"
              placeholder="Title"
              aria-label="Note Title"
          />
          <div className="absolute bottom-6 left-0 w-full h-0.5 bg-yellow-400 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 ease-in-out origin-center"/>
        </div>
        <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            onClick={handleEditorClick}
            className="w-full leading-relaxed bg-transparent focus:outline-none text-zinc-800 dark:text-zinc-200 font-mono p-2 rounded-md transition-shadow"
            data-placeholder="Start writing..."
            aria-label="Note Content"
        />
        {table && <TableComponent data={table} onChange={handleTableChange} />}
      </div>
    </div>
  );
};

export default Editor;