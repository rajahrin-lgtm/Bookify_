import React, { useState, useRef } from 'react';
import { User, AuthMethod } from '../types';
import { Button } from './Button';
import { Camera, User as UserIcon, Mail, Shield, Save, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { updateUserProfile } from '../services/userService';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPreviewImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (user.authMethod === AuthMethod.GUEST) {
          throw new Error("Guest accounts cannot update profiles. Please sign in.");
      }

      const file = fileInputRef.current?.files?.[0];
      const result = await updateUserProfile(name, file);
      
      onUpdateUser({
          name: result.displayName,
          avatar: result.photoURL || user.avatar
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up pb-12">
      
      {/* Page Header */}
      <div className="mb-8 px-1">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Account Settings</h1>
        <p className="text-slate-500">Manage your profile, preferences, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-br from-brand-600 to-indigo-700 relative">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                {/* Avatar & Basic Info */}
                <div className="px-6 pb-8 text-center relative">
                    <div className="relative inline-block -mt-16 mb-4 group">
                         <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center relative z-10">
                            {previewImage || user.avatar ? (
                                <img src={previewImage || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                    <UserIcon size={48} />
                                </div>
                            )}
                         </div>
                         
                         {user.authMethod !== AuthMethod.GUEST && (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-1 right-1 z-20 bg-slate-900 text-white p-2.5 rounded-full shadow-lg hover:bg-brand-600 transition-all hover:scale-110 active:scale-95 border-2 border-white"
                                title="Upload Photo"
                            >
                                <Camera size={16} />
                            </button>
                         )}
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{name || user.name}</h2>
                    <p className="text-sm text-slate-500 mb-4">{user.email || 'No email connected'}</p>
                    
                    <div className="flex justify-center gap-2">
                         <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border flex items-center gap-1.5 ${
                             user.authMethod === AuthMethod.GUEST 
                             ? 'bg-orange-50 text-orange-600 border-orange-100'
                             : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                         }`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${user.authMethod === AuthMethod.GUEST ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                             {user.authMethod === AuthMethod.GUEST ? 'Guest Account' : 'Verified Member'}
                         </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Edit Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <UserIcon size={20} className="text-brand-600" />
                        Personal Information
                    </h3>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                     {/* Feedback Messages */}
                     {message && (
                        <div className={`p-4 rounded-xl text-sm flex items-start gap-3 animate-scale-in ${
                            message.type === 'success' 
                                ? 'bg-green-50 text-green-700 border border-green-100' 
                                : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                            {message.type === 'success' ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                            {message.text}
                        </div>
                     )}

                     <div className="grid grid-cols-1 gap-6">
                         <div className="space-y-2">
                             <label className="text-sm font-semibold text-slate-700">Display Name</label>
                             <div className="relative">
                                 <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                 <input 
                                     type="text" 
                                     value={name} 
                                     onChange={(e) => setName(e.target.value)}
                                     disabled={user.authMethod === AuthMethod.GUEST}
                                     className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                     placeholder="Enter your name"
                                 />
                             </div>
                             {user.authMethod === AuthMethod.GUEST && <p className="text-xs text-orange-500">Guest accounts cannot verify display names.</p>}
                         </div>

                         <div className="space-y-2">
                             <label className="text-sm font-semibold text-slate-700">Email Address</label>
                             <div className="relative">
                                 <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                 <input 
                                     type="text" 
                                     value={user.email || 'Not connected'} 
                                     disabled 
                                     className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                                 />
                             </div>
                             <p className="text-xs text-slate-400">Email is managed by your authentication provider.</p>
                         </div>
                     </div>

                     {user.authMethod !== AuthMethod.GUEST && (
                         <div className="pt-4 flex justify-end">
                             <Button 
                                type="submit" 
                                disabled={isSaving}
                                className="shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all"
                             >
                                 {isSaving ? 'Saving Changes...' : <span className="flex items-center gap-2"><Save size={18} /> Save Changes</span>}
                             </Button>
                         </div>
                     )}
                </form>
            </div>

            {/* Privacy & Security Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                 <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <Shield size={20} className="text-brand-600" />
                    Privacy & Security
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                            <Key size={20} />
                         </div>
                         <div>
                             <h4 className="text-sm font-semibold text-slate-900">Authentication</h4>
                             <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                 You are signed in via <span className="font-medium text-slate-700 capitalize">{user.authMethod.toLowerCase()}</span>.
                                 {user.authMethod === 'GOOGLE' && ' Your password and account security are handled by Google.'}
                                 {user.authMethod === 'GUEST' && ' Your session is temporary. Sign up to save your library permanently.'}
                             </p>
                         </div>
                    </div>

                     <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100/50">
                         <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                            <Shield size={20} />
                         </div>
                         <div>
                             <h4 className="text-sm font-semibold text-blue-900">Data Privacy</h4>
                             <p className="text-sm text-blue-800/80 mt-1 leading-relaxed">
                                 Your email address is kept private and used only for login. 
                                 Only your display name and the books you explicitly upload to the public library are visible to other members.
                             </p>
                         </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};