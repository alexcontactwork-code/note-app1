import React from 'react';
import { Note } from '../types';

interface NoteListItemProps {
  note: Note;
  isActive: boolean;
  isDeleting: boolean;
  isNew: boolean;
  onClick: () => void;
}

const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) {
        return 'Yesterday';
    }
    if (diffDays <= 7) {
        return date.toLocaleDateString([], { weekday: 'long' });
    }
    return date.toLocaleDateString();
};

const getPreviewFromHTML = (htmlContent: string) => {
  if (!htmlContent) return 'No additional text';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const text = (tempDiv.textContent || tempDiv.innerText || "").trim();
  return text.split('\n')[0] || 'No additional text';
};


const NoteListItem: React.FC<NoteListItemProps> = ({ note, isActive, isDeleting, isNew, onClick }) => {
  const title = note.title || "Untitled";
  const preview = getPreviewFromHTML(note.content);

  const activeClasses = isActive 
    ? 'border-l-yellow-400 bg-gradient-to-r from-yellow-100/80 to-zinc-100/50 dark:from-yellow-900/40 dark:to-zinc-800/50 animate-background-pan' 
    : 'border-l-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50';
    
  const itemClasses = [
    'p-4',
    'cursor-pointer',
    'border-b',
    'border-l-4',
    'border-zinc-200',
    'dark:border-zinc-800',
    'transition-all',
    'duration-300',
    'ease-in-out',
    'hover:scale-[1.03] hover:-rotate-1',
    activeClasses,
    isDeleting ? 'animate-fade-out' : '',
    isNew ? 'animate-pop-in' : ''
  ].join(' ');

  return (
    <div
      onClick={onClick}
      className={itemClasses}
      role="button"
      aria-selected={isActive}
    >
      <h2 className={`font-semibold text-base truncate text-zinc-800 dark:text-zinc-100`}>{title}</h2>
      <div className="flex items-center mt-1.5 space-x-3">
        <p className={`text-xs font-medium flex-shrink-0 text-zinc-500 dark:text-zinc-400`}>
          {formatDate(note.lastModified)}
        </p>
        <p className={`text-sm text-zinc-500 dark:text-zinc-400 truncate`}>
          {preview}
        </p>
      </div>
    </div>
  );
};

export default React.memo(NoteListItem);