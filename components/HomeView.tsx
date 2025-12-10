import React, { useState, useMemo } from 'react';
import { CommunityBook } from '../types';
import { CommunityBookItem } from './CommunityBookItem';
import { Search, Globe, Filter, Sparkles, X, ChevronDown, Book, Users, Layers, TrendingUp, Clock } from 'lucide-react';

interface HomeViewProps {
  books: CommunityBook[];
  loading: boolean;
  currentUserId: string;
  onRead: (book: CommunityBook) => void;
  onDelete: (e: React.MouseEvent, book: CommunityBook) => void;
  isGuest: boolean;
  onGuestAction: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ books, loading, currentUserId, onRead, onDelete, isGuest, onGuestAction }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'a-z'>('newest');

  // Statistics
  const stats = useMemo(() => {
    const authors = new Set(books.map(b => b.author)).size;
    const genresCount = new Set(books.map(b => b.genre)).size;
    return {
        books: books.length,
        authors,
        genres: genresCount
    };
  }, [books]);

  // Extract unique languages
  const languages = useMemo(() => {
      const l = new Set(books.map(b => b.language || 'English'));
      return ['All', ...Array.from(l).sort()];
  }, [books]);

  // Quick Genre Pills (Common + top from data)
  const quickGenres = ['All', 'Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy', 'Mystery', 'Biography', 'Technology'];

  const filteredBooks = useMemo(() => {
    let result = books;

    // Search
    if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        result = result.filter(book => 
          book.title.toLowerCase().includes(lowerQuery) || 
          book.author?.toLowerCase().includes(lowerQuery) ||
          book.uploaderName.toLowerCase().includes(lowerQuery) ||
          book.isbn?.includes(lowerQuery)
        );
    }

    // Filter Genre
    if (selectedGenre !== 'All') {
        result = result.filter(book => (book.genre || 'Uncategorized') === selectedGenre);
    }

    // Filter Language
    if (selectedLanguage !== 'All') {
        result = result.filter(book => (book.language || 'English') === selectedLanguage);
    }

    // Sort
    result.sort((a, b) => {
        if (sortOrder === 'newest') return b.uploadDate - a.uploadDate;
        if (sortOrder === 'oldest') return a.uploadDate - b.uploadDate;
        if (sortOrder === 'a-z') return a.title.localeCompare(b.title);
        return 0;
    });

    return result;
  }, [books, searchQuery, selectedGenre, selectedLanguage, sortOrder]);

  // Featured Books (Top 5 Newest)
  const featuredBooks = useMemo(() => {
      if (searchQuery || selectedGenre !== 'All' || selectedLanguage !== 'All') return [];
      return [...books].sort((a, b) => b.uploadDate - a.uploadDate).slice(0, 5);
  }, [books, searchQuery, selectedGenre, selectedLanguage]);

  const clearFilters = () => {
      setSearchQuery('');
      setSelectedGenre('All');
      setSelectedLanguage('All');
      setSortOrder('newest');
  };

  return (
    <div className="animate-fade-in-up pb-12">
      
      {/* Immersive Hero Section */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 mb-10">
        {/* Abstract Background */}
        <div className="absolute inset-0">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-brand-950 to-indigo-950 opacity-90"></div>
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        <div className="relative z-10 px-6 py-16 md:py-20 flex flex-col items-center text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-brand-100 text-xs font-medium backdrop-blur-md mb-6">
                <Sparkles size={12} className="text-brand-300" />
                <span>AI-Powered Library</span>
             </div>
             
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight mb-6">
                Explore a Universe of <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 to-indigo-300">Knowledge & Stories</span>
             </h1>
             
             <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
                Join our community of readers. Discover rare documents, academic papers, and timeless novels uploaded by people like you.
             </p>

             {/* Floating Search Bar */}
             <div className="w-full max-w-2xl relative group">
                <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-xl group-hover:bg-brand-500/30 transition-all"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center p-2 shadow-2xl transition-transform transform focus-within:scale-[1.01]">
                    <div className="pl-4 text-slate-300">
                        <Search className="h-6 w-6" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none text-white placeholder-slate-300 focus:ring-0 text-lg px-4 py-3"
                        placeholder="Search by title, author, or ISBN..."
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="p-2 text-slate-300 hover:text-white">
                            <X size={20} />
                        </button>
                    )}
                </div>
             </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-10 px-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center md:flex-row md:justify-start md:text-left md:gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-2 md:mb-0"><Book size={24} /></div>
              <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.books}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Books</div>
              </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center md:flex-row md:justify-start md:text-left md:gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-2 md:mb-0"><Users size={24} /></div>
              <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.authors}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Authors</div>
              </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center md:flex-row md:justify-start md:text-left md:gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl mb-2 md:mb-0"><Layers size={24} /></div>
              <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.genres}</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Genres</div>
              </div>
          </div>
      </div>

      {/* Featured Section (Only shows when not filtering) */}
      {featuredBooks.length > 0 && (
          <div className="mb-12">
              <div className="flex items-center gap-2 mb-6 px-1">
                  <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                    <TrendingUp size={18} />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-slate-900">Featured & New</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {featuredBooks.map((book, i) => (
                      <div key={book.id + '_featured'} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
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
          </div>
      )}

      {/* Filter Toolbar */}
      <div className="sticky top-20 z-30 mb-8 transition-all">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/50 p-3 md:p-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  
                  {/* Genre Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide no-scrollbar mask-linear-fade">
                      <Filter size={16} className="text-slate-400 shrink-0 mr-1" />
                      {quickGenres.map(genre => (
                          <button
                              key={genre}
                              onClick={() => setSelectedGenre(genre)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                  selectedGenre === genre 
                                  ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                          >
                              {genre}
                          </button>
                      ))}
                  </div>

                  {/* Dropdowns */}
                  <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-200 pt-3 md:pt-0 justify-end">
                       <div className="relative group">
                          <select
                              value={selectedLanguage}
                              onChange={(e) => setSelectedLanguage(e.target.value)}
                              className="appearance-none bg-transparent pl-3 pr-8 py-1.5 rounded-lg border border-transparent hover:border-slate-300 text-xs font-semibold text-slate-700 focus:ring-0 cursor-pointer transition-colors"
                          >
                              {languages.map(l => <option key={l} value={l}>{l === 'All' ? 'Language: All' : l}</option>)}
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                       </div>

                       <div className="w-[1px] h-4 bg-slate-300 mx-1"></div>

                       <div className="relative group">
                          <select
                              value={sortOrder}
                              onChange={(e) => setSortOrder(e.target.value as any)}
                              className="appearance-none bg-transparent pl-3 pr-8 py-1.5 rounded-lg border border-transparent hover:border-slate-300 text-xs font-semibold text-slate-700 focus:ring-0 cursor-pointer transition-colors"
                          >
                              <option value="newest">Sort: Newest</option>
                              <option value="oldest">Sort: Oldest</option>
                              <option value="a-z">Sort: A-Z</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                       </div>

                       {(selectedGenre !== 'All' || selectedLanguage !== 'All' || searchQuery) && (
                          <button onClick={clearFilters} className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Clear Filters">
                              <X size={16} />
                          </button>
                       )}
                  </div>
              </div>
          </div>
      </div>

      {/* Main Grid */}
      <div>
        <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                <Globe size={20} className="text-brand-600" />
                {searchQuery || selectedGenre !== 'All' ? 'Search Results' : 'All Books'}
            </h2>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {filteredBooks.length} items
            </span>
        </div>

        {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {[1,2,3,4,5,6,7,8,9,10].map(i => (
                    <div key={i} className="aspect-[2/3] bg-slate-100 rounded-xl animate-pulse"></div>
                ))}
            </div>
        ) : filteredBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 text-center shadow-sm">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                    <Search className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">No matches found</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
                    We couldn't find any books matching your current filters. Try searching for something else.
                </p>
                <button 
                    onClick={clearFilters} 
                    className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl"
                >
                    Clear all filters
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredBooks.map((book, index) => (
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
    </div>
  );
};