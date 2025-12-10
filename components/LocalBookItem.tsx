import React from 'react';
import { LocalBook } from '../types';
import { FileText, Trash2, BookOpen } from 'lucide-react';

interface LocalBookItemProps {
  book: LocalBook;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const LocalBookItem: React.FC<LocalBookItemProps> = ({ book, onClick, onDelete }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-slate-100 p-4 cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-100 transition-colors">
          <FileText size={24} />
        </div>
        <button 
          onClick={onDelete}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Remove from library"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-grow">
        <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1 group-hover:text-brand-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-slate-500">
          {new Date(book.uploadDate).toLocaleDateString()} • {book.size}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center text-xs font-medium text-brand-600">
        <BookOpen size={14} className="mr-1.5" />
        Read Now
      </div>
    </div>
  );
};