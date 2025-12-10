import React, { useState, useRef, useEffect } from 'react';
import { CommunityBook } from '../types';
import { Trash2, Download, User, MoreVertical, Book } from 'lucide-react';

interface CommunityBookItemProps {
  book: CommunityBook;
  currentUserId: string;
  onRead: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isGuest?: boolean;
  onGuestAction?: () => void;
}

export const CommunityBookItem: React.FC<CommunityBookItemProps> = ({ 
  book, 
  currentUserId, 
  onRead, 
  onDelete,
  isGuest,
  onGuestAction
}) => {
  const isOwner = book.uploaderId === currentUserId;
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    
    if (showMenu) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    
    if (isGuest && onGuestAction) {
        onGuestAction();
        return;
    }

    const link = document.createElement('a');
    link.href = book.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = book.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop bubbling to card click
    setShowMenu(false);
    onDelete(e);
  };
  
  const toggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowMenu((prev) => !prev);
  };

  return (
    <div 
      onClick={onRead}
      className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 border border-slate-100 hover:border-brand-100/50 hover:-translate-y-1 cursor-pointer flex flex-col h-full overflow-hidden ${showMenu ? 'z-50' : 'z-auto'}`}
    >
      {/* Cover Image Area */}
      <div className="aspect-[2/3] relative bg-brand-50 overflow-hidden border-b border-brand-100/50">
        {book.coverUrl && !imageError ? (
            <img 
                src={book.coverUrl} 
                alt={book.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                loading="lazy"
                onError={() => setImageError(true)}
            />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center group-hover:bg-brand-100 transition-colors duration-300">
                <Book size={48} className="text-brand-300 mb-2 group-hover:text-brand-400 transition-colors duration-300" strokeWidth={1.5} />
            </div>
        )}
        
        {/* Format Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm border border-white/50">
            {book.format}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow bg-white relative">
        <h3 className="font-serif font-bold text-lg text-slate-900 leading-tight line-clamp-2 mb-1.5 group-hover:text-brand-600 transition-colors">
          {book.title}
        </h3>
        
        <p className="text-xs font-medium text-slate-500 mb-3 flex items-center gap-1.5">
             <span className="w-1 h-1 rounded-full bg-brand-400"></span>
             {book.author || 'Unknown Author'}
        </p>

        {book.genre && (
            <div className="mb-4">
                <span className="inline-flex items-center px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] rounded-md border border-slate-100 font-medium group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-100/50 transition-colors">
                    {book.genre}
                </span>
            </div>
        )}

        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 relative">
             <span className="flex items-center gap-2 hover:text-slate-600 transition-colors">
                <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <User size={12} />
                </div>
                <span className="truncate max-w-[80px] font-medium">{book.uploaderName}</span>
             </span>
             
             {/* Options Menu Trigger */}
             <div className="relative" ref={menuRef}>
                 <button 
                    onClick={toggleMenu}
                    className={`p-1.5 rounded-lg transition-all ${showMenu ? 'bg-slate-100 text-slate-900' : 'text-slate-300 hover:text-brand-600 hover:bg-brand-50'}`}
                    title="More options"
                 >
                     <MoreVertical size={16} />
                 </button>

                 {/* Dropdown Menu */}
                 {showMenu && (
                     <div className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 overflow-hidden animate-scale-in origin-bottom-right z-[60]">
                         <button 
                            onClick={handleDownload}
                            className="w-full text-left px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                         >
                             <Download size={14} className="text-slate-400" /> Download
                         </button>
                         {isOwner && (
                             <button 
                                onClick={handleDelete}
                                className="w-full text-left px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 border-t border-slate-50 transition-colors"
                             >
                                 <Trash2 size={14} /> Delete
                             </button>
                         )}
                     </div>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};