
export enum AuthMethod {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  GUEST = 'GUEST',
  NONE = 'NONE'
}

export type AppView = 'home' | 'library' | 'profile';

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  authMethod: AuthMethod;
  bio?: string;
}

export interface Book {
  title: string;
  author: string;
  year: string;
  genre: string;
  description: string;
  isbn?: string; 
}

export interface LocalBook {
  id: string;
  file: File;
  title: string;
  uploadDate: number;
  size: string;
}

export interface CommunityBook {
  id: string;
  title: string;
  url: string; // Firebase Storage URL
  uploadDate: number;
  size: string;
  uploaderId: string;
  uploaderName: string;
  file?: File;
  
  // Enhanced Metadata
  description?: string;
  author?: string;
  genre?: string;
  year?: string;
  isbn?: string;
  language?: string;
  tags?: string[];
  coverUrl?: string;
  format: 'pdf' | 'epub' | 'mobi' | 'txt' | 'other';
  
  // New Fields
  seriesName?: string;
  chapterCount?: number;
}

export interface SearchState {
  query: string;
  results: Book[];
  isLoading: boolean;
  error: string | null;
}
