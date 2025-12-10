import React from 'react';
import { Book as BookType } from '../types';
import { BookOpen, Book } from 'lucide-react';

interface BookCardProps {
  book: BookType;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full">
      <div className="relative aspect-[2/3] overflow-hidden bg-brand-50 border-b border-brand-100/50">
        <div className="w-full h-full flex items-center justify-center group-hover:bg-brand-100 transition-colors duration-300">
           <Book size={48} className="text-brand-300 group-hover:text-brand-400 transition-colors duration-300" strokeWidth={1.5} />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-sm font-medium bg-brand-600/90 px-3 py-1 rounded-full backdrop-blur-sm">
            {book.genre}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-lg font-bold text-slate-900 leading-tight line-clamp-2">
            {book.title}
          </h3>
        </div>
        
        <p className="text-sm text-brand-600 font-medium mb-3">{book.author} <span className="text-slate-400">•</span> {book.year}</p>
        
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
          {book.description}
        </p>

        <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between text-xs text-slate-400">
           <span className="flex items-center gap-1 group-hover:text-brand-600 transition-colors">
             <BookOpen size={14} /> Read More
           </span>
        </div>
      </div>
    </div>
  );
};