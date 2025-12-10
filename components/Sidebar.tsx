import React from 'react';
import { Home, Library, User, LogOut, BookOpen, Upload, Compass } from 'lucide-react';
import { AppView, User as UserType } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  user: UserType;
  onLogout: () => void;
  onUploadClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  user, 
  onLogout,
  onUploadClick
}) => {
  const navItems = [
    { id: 'home' as AppView, icon: Compass, label: 'Discover' },
    { id: 'library' as AppView, icon: Library, label: 'My Library' },
    { id: 'profile' as AppView, icon: User, label: 'Profile' },
  ];

  return (
    <div className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 h-screen sticky top-0 z-40 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
      <div className="p-8 pb-6 flex items-center gap-3">
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-2.5 rounded-xl shadow-lg shadow-brand-200">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <span className="font-serif text-2xl font-bold text-slate-900 tracking-tight">Bookify</span>
      </div>

      <div className="flex flex-col flex-grow px-4 py-6 space-y-1.5">
        <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm relative overflow-hidden ${
              currentView === item.id 
                ? 'bg-brand-50 text-brand-700 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {currentView === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-r-full"></div>
            )}
            <item.icon 
                size={22} 
                strokeWidth={currentView === item.id ? 2.5 : 2}
                className={`transition-colors duration-200 ${currentView === item.id ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
            />
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-5 mt-auto bg-slate-50/50 border-t border-slate-100">
        <button 
            onClick={onUploadClick}
            className="w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl shadow-lg shadow-slate-200 flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md mb-6 font-medium text-sm"
        >
            <Upload size={18} strokeWidth={2.5} /> 
            <span>Upload New Book</span>
        </button>

        <div className="flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="relative shrink-0">
                    {user.avatar ? (
                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" alt="Avatar" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-700 font-bold border border-white shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-600 transition-colors">{user.name}</span>
                    <span className="text-[10px] font-medium text-slate-500 truncate uppercase tracking-wide opacity-80">{user.authMethod === 'GUEST' ? 'Guest Access' : 'Member'}</span>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Sign Out"
            >
                <LogOut size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};