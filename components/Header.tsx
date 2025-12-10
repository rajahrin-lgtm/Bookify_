import React, { useState, useRef, useEffect } from 'react';
import { Compass, Library, User, LogOut, BookOpen, Menu, X, ChevronDown } from 'lucide-react';
import { AppView, User as UserType } from '../types';

interface HeaderProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  user: UserType;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onChangeView, 
  user, 
  onLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'home' as AppView, icon: Compass, label: 'Discover' },
    { id: 'library' as AppView, icon: Library, label: 'My Library' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => onChangeView('home')}
          >
             <div className="relative">
                 <div className="absolute inset-0 bg-brand-400 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                 <div className="relative bg-gradient-to-br from-brand-500 to-brand-600 p-2.5 rounded-xl shadow-sm text-white transform group-hover:scale-105 transition-transform duration-200">
                     <BookOpen className="h-6 w-6" />
                 </div>
             </div>
             <div className="flex flex-col">
                 <span className="font-serif text-2xl font-bold text-slate-900 tracking-tight leading-none">Bookify</span>
                 <span className="text-[10px] font-medium text-brand-600 tracking-widest uppercase">Community Library</span>
             </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center p-1.5 bg-slate-100/50 rounded-full border border-slate-200/50 backdrop-blur-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5 transform scale-100'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <item.icon size={18} className={`transition-colors ${currentView === item.id ? 'text-brand-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Section: Profile & Mobile Toggle */}
          <div className="flex items-center gap-4">
             
             {/* Desktop Profile Dropdown */}
             <div className="hidden md:block relative" ref={profileRef}>
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
                >
                    <div className="flex flex-col items-end mr-1">
                        <span className="text-sm font-bold text-slate-700 leading-none">{user.name.split(' ')[0]}</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase">{user.authMethod === 'GUEST' ? 'Guest' : 'Member'}</span>
                    </div>
                    
                    <div className="relative">
                        {user.avatar ? (
                            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-brand-200 transition-all" alt="Avatar" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-100 to-indigo-100 flex items-center justify-center text-brand-700 font-bold text-sm ring-2 ring-white shadow-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-scale-in origin-top-right">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                            <p className="text-sm font-bold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email || 'Guest User'}</p>
                        </div>
                        <div className="p-2">
                            <button 
                                onClick={() => {
                                    onChangeView('profile');
                                    setIsProfileOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                <User size={18} className="text-slate-400" />
                                My Profile
                            </button>
                        </div>
                        <div className="p-2 border-t border-slate-50">
                            <button 
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
             </div>

             {/* Mobile Menu Button */}
             <button
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
             >
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl animate-fadeIn shadow-lg absolute w-full left-0 z-50 h-[calc(100vh-80px)] overflow-y-auto">
          <div className="p-4 space-y-2">
            {[...navItems, { id: 'profile' as AppView, icon: User, label: 'Profile' }].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-medium transition-all ${
                   currentView === item.id
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl ${currentView === item.id ? 'bg-white shadow-sm text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                    <item.icon size={20} />
                </div>
                {item.label}
              </button>
            ))}
            
            <div className="border-t border-slate-100 my-4 pt-4">
               <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-2xl mb-4">
                   {user.avatar ? (
                        <img src={user.avatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" alt="Avatar" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg ring-2 ring-white">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                   <div className="flex flex-col">
                       <span className="text-base font-bold text-slate-900">{user.name}</span>
                       <span className="text-xs text-slate-500">{user.email || (user.authMethod === 'GUEST' ? 'Guest Access' : 'Member')}</span>
                   </div>
               </div>
               <button
                 onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                 }}
                 className="w-full flex items-center gap-4 px-4 py-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-2xl transition-colors border border-red-100"
               >
                 <div className="p-2 bg-red-100 rounded-xl text-red-600">
                    <LogOut size={20} />
                 </div>
                 Sign Out
               </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};