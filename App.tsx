
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Note } from './types';
import NoteList from './components/NoteList.tsx';
import Editor from './components/Editor.tsx';
import { useLocalStorage } from './hooks/useLocalStorage';

const MIN_SIDEBAR_WIDTH = 256; // 16rem
const MAX_SIDEBAR_WIDTH = 640; // 40rem

const App: React.FC = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [newNoteId, setNewNoteId] = useState<string | null>(null);

  const [sidebarWidth, setSidebarWidth] = useLocalStorage<number>('sidebar-width', 320);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    const newWidth = e.clientX;
    if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
    }
  }, [setSidebarWidth]);

  useEffect(() => {
    if (isResizing) {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }
    return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
  }, [isResizing, resize, stopResizing]);


  useEffect(() => {
    if (deletingNoteId) return;
    const sorted = [...notes].sort((a, b) => b.lastModified - a.lastModified);
    if (sorted.length > 0 && (!activeNoteId || !notes.find(n => n.id === activeNoteId))) {
      setActiveNoteId(sorted[0].id);
    }
    if (notes.length === 0) {
      setActiveNoteId(null);
    }
  }, [notes, activeNoteId, deletingNoteId]);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => b.lastModified - a.lastModified);
  }, [notes]);

  const handleNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      lastModified: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setNewNoteId(newNote.id);
    setTimeout(() => setNewNoteId(null), 1000); // Animation duration
  };

  const handleDeleteNote = () => {
    if (!activeNoteId) return;
    setDeletingNoteId(activeNoteId);

    setTimeout(() => {
      setNotes(notes => notes.filter(note => note.id !== activeNoteId));
      setDeletingNoteId(null);
    }, 300); // Animation duration
  };
  
  const updateNote = (id: string, updatedFields: Partial<Omit<Note, 'id'>>) => {
     setNotes(notes => notes.map(note => 
      note.id === id 
        ? { ...note, ...updatedFields, lastModified: Date.now() } 
        : note
    ));
  }

  const handleUpdateNote = (updatedFields: Partial<Omit<Note, 'id'>>) => {
    if (!activeNoteId) return;
    const currentNote = notes.find(n => n.id === activeNoteId);
    if (!currentNote) return;

    // Only update if there's an actual change to prevent unnecessary re-renders and timestamp updates
    const hasChanged = Object.keys(updatedFields).some(key => {
      const fieldKey = key as keyof typeof updatedFields;
      const newValue = updatedFields[fieldKey];
      const oldValue = currentNote[fieldKey as keyof typeof currentNote];

      // Deep compare arrays/objects, otherwise shallow compare
      if (typeof newValue === 'object' && newValue !== null || typeof oldValue === 'object' && oldValue !== null) {
          return JSON.stringify(newValue) !== JSON.stringify(oldValue);
      }

      return newValue !== oldValue;
    });
    
    if (hasChanged) {
        updateNote(activeNoteId, updatedFields);
    }
  };
  
  const activeNote = useMemo(() => notes.find(note => note.id === activeNoteId), [notes, activeNoteId]);

  return (
    <div className="flex h-screen font-sans antialiased text-zinc-800 dark:text-zinc-200">
      <div 
        style={{ width: `${sidebarWidth}px` }} 
        className="h-full flex-shrink-0 animate-slide-in-from-left"
        id="notelist-sidebar"
      >
        <NoteList
          notes={sortedNotes}
          activeNoteId={activeNoteId}
          deletingNoteId={deletingNoteId}
          newNoteId={newNoteId}
          onSelectNote={setActiveNoteId}
          onNewNote={handleNewNote}
          noteCount={notes.length}
        />
      </div>

      <div
        onMouseDown={startResizing}
        className="w-1.5 flex-shrink-0 cursor-col-resize bg-transparent group"
        role="separator"
        aria-orientation="vertical"
        aria-controls="notelist-sidebar"
        aria-label="Resize sidebar"
        title="Resize sidebar"
      >
        <div className="w-0.5 h-full bg-zinc-200 dark:bg-zinc-700 mx-auto group-hover:bg-yellow-400 dark:group-hover:bg-yellow-500 group-active:bg-yellow-500 dark:group-active:bg-yellow-600 transition-all duration-200 group-hover:w-full group-active:w-full" />
      </div>

      <main className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-900 min-w-0 animate-slide-in-from-right">
        <Editor
          key={activeNote?.id || 'empty'}
          activeNote={activeNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
        />
      </main>
    </div>
  );
};

export default App;
