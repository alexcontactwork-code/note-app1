export interface Note {
  id: string;
  title: string;
  content: string;
  table?: string[][];
  lastModified: number;
}