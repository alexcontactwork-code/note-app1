import { useState, useEffect } from 'react';

export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      let parsedItem = JSON.parse(item);

      // Migration for notes app: content's first line to title
      if (key === 'notes' && Array.isArray(parsedItem)) {
        const needsMigration = parsedItem.some(note => note.title === undefined && note.content !== undefined);
        if (needsMigration) {
          const migratedData = parsedItem.map(note => {
            if (note.title !== undefined) return note;
            
            const lines = note.content.split('\n');
            const title = lines[0].trim() || 'New Note';
            const content = lines.slice(1).join('\n');
            return { ...note, title, content };
          });
          
          window.localStorage.setItem(key, JSON.stringify(migratedData));
          return migratedData as T;
        }
      }
      
      return parsedItem;

    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore =
        typeof storedValue === 'function'
          ? storedValue(storedValue)
          : storedValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
