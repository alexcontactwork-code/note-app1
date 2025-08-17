
import React from 'react';
import { Note } from '../types';
import NoteListItem from './NoteListItem';
import { PlusSquare } from './Icons';

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  deletingNoteId: string | null;
  newNoteId: string | null;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  noteCount: number;
}

const NoteList: React.FC<NoteListProps> = ({ notes, activeNoteId, deletingNoteId, newNoteId, onSelectNote, onNewNote, noteCount }) => {
  const buttonClasses = "group text-zinc-500 dark:text-zinc-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 rounded-md";

  return (
    <div className="w-full h-full bg-white dark:bg-[#18181a] border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center flex-shrink-0 bg-gradient-to-b from-zinc-50/50 to-transparent dark:from-zinc-900/50">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Notes</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onNewNote} 
            className={buttonClasses}
            title="New Note"
            aria-label="Create new note"
          >
            <PlusSquare className="w-6 h-6 group-hover:animate-jiggle" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {notes.length > 0 ? (
          notes.map(note => (
            <NoteListItem
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              isDeleting={note.id === deletingNoteId}
              isNew={note.id === newNoteId}
              onClick={() => onSelectNote(note.id)}
            />
          ))
        ) : (
          <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 animate-fade-in">
            <p className="animate-shimmer">No notes yet.</p>
            <p>Click the [+] button to create one!</p>
          </div>
        )}
      </div>
      <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <span key={noteCount} className="inline-block animate-pop-in">
          {noteCount} {noteCount === 1 ? 'Note' : 'Notes'}
        </span>
      </div>
    </div>
  );
};

export default NoteList;
