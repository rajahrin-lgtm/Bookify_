import React, { useState, useMemo } from 'react';
import { CommunityBook } from '../types';
import { CommunityBookItem } from './CommunityBookItem';
import { Upload, Bookmark, BookOpen, Layers, Plus } from 'lucide-react';
import { Button } from './Button';

interface MyLibraryViewProps {
  books: CommunityBook[];
  currentUserId: string;
  onRead: (book: CommunityBook) => void;
  onDelete: (e: React.MouseEvent, book: CommunityBook) => void;
  onUploadClick: () => void;
  isGuest: boolean;
  onGuestAction: () => void;
}

export const MyLibraryView: React.FC<MyLibraryViewProps> = ({ books, currentUserId, onRead, onDelete, onUploadClick, isGuest, onGuestAction }) => {
  const [activeTab, setActiveTab] = useState<'uploads' | 'saved'>('uploads');

  // Filter for books uploaded by this user
  const myUploads = useMemo(() => books.filter(b => b.uploaderId === currentUserId), [books, currentUserId]);

  // Filter for bookmarked books (Checking localStorage keys)
  const bookmarkedBooks = useMemo(() => books.filter(b => {
      return localStorage.getItem(`bookify_bookmarks_${b.id}`) !== null;
  }), [books]);

  return (
    <div className="animate-fade-in-up pb-12">
      
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">My Library</h1>
            <p className="text-slate-500">Manage your contributions and saved collection.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
             <div className="flex gap-6 pr-2">
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-slate-900">{myUploads.length}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Uploads</span>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                 <div className="flex flex-col">
                    <span className="text-2xl font-bold text-slate-900">{bookmarkedBooks.length}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Saved</span>
                </div>
             </div>
             
             <Button 
                onClick={onUploadClick} 
                className="shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
             >
                <Plus size={18} className="mr-2" /> Upload Book
             </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 mb-8">
        <div className="flex gap-8">
            <button 
                onClick={() => setActiveTab('uploads')}
                className={`pb-4 text-sm font-medium transition-all relative ${
                    activeTab === 'uploads' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
                <span className="flex items-center gap-2">
                    <Layers size={18} /> My Uploads
                </span>
                {activeTab === 'uploads' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full animate-scale-in"></div>
                )}
            </button>
            <button 
                onClick={() => setActiveTab('saved')}
                className={`pb-4 text-sm font-medium transition-all relative ${
                    activeTab === 'saved' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
                <span className="flex items-center gap-2">
                    <Bookmark size={18} /> Saved Books
                </span>
                {activeTab === 'saved' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full animate-scale-in"></div>
                )}
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'uploads' && (
            <div className="animate-fade-in">
                {myUploads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                        <div className="bg-white p-5 rounded-full shadow-sm mb-5 border border-slate-100">
                           <Upload className="h-8 w-8 text-brand-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Share your first book</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
                            Contribute to the community by uploading PDF, EPUB, or text files.
                        </p>
                        <Button variant="outline" onClick={onUploadClick} className="border-slate-300 hover:border-brand-500 hover:text-brand-600">
                            Upload Now
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {/* Add New Card - Optional visual cue */}
                        <div 
                            onClick={onUploadClick}
                            className="group relative bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition-all cursor-pointer flex flex-col items-center justify-center text-center p-4 min-h-[280px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-brand-500 group-hover:scale-110 transition-all mb-3 shadow-sm">
                                <Plus size={24} />
                            </div>
                            <span className="font-semibold text-slate-600 group-hover:text-brand-700">Upload New</span>
                        </div>

                        {myUploads.map((book, index) => (
                            <div key={book.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <CommunityBookItem 
                                    book={book} 
                                    currentUserId={currentUserId}
                                    onRead={() => onRead(book)}
                                    onDelete={(e) => onDelete(e, book)}
                                    isGuest={isGuest}
                                    onGuestAction={onGuestAction}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'saved' && (
            <div className="animate-fade-in">
                 {bookmarkedBooks.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                         <div className="bg-white p-5 rounded-full shadow-sm mb-5 border border-slate-100">
                             <Bookmark className="h-8 w-8 text-orange-400" />
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 mb-2">No bookmarks yet</h3>
                         <p className="text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                             When reading a book, click the bookmark icon or save it to read later. It will appear here.
                         </p>
                     </div>
                 ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {bookmarkedBooks.map((book, index) => (
                            <div key={book.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <CommunityBookItem 
                                    book={book} 
                                    currentUserId={currentUserId}
                                    onRead={() => onRead(book)}
                                    onDelete={(e) => onDelete(e, book)}
                                    isGuest={isGuest}
                                    onGuestAction={onGuestAction}
                                />
                            </div>
                        ))}
                    </div>
                 )}
            </div>
        )}
      </div>
    </div>
  );
};