import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { X, Upload, FileText, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { autoFillBookMetadata } from '../services/geminiService';
import { uploadBookToCloud } from '../services/cloudService';

interface UploadModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ userId, userName, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    year: '',
    language: 'English',
    description: '',
    tags: '',
    seriesName: '',
    chapterCount: ''
  });

  const [loadingAutoFill, setLoadingAutoFill] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Auto-set title from filename if empty
      if (!metadata.title) {
          const name = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
          setMetadata(prev => ({ ...prev, title: name }));
      }
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setPreviewCover(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoFill = async () => {
    if (!metadata.isbn && !metadata.title) {
        alert("Please enter an ISBN or Title first.");
        return;
    }
    setLoadingAutoFill(true);
    try {
        const query = metadata.isbn || metadata.title;
        const result = await autoFillBookMetadata(query);
        setMetadata(prev => ({
            ...prev,
            title: result.title || prev.title,
            author: result.author || prev.author,
            genre: result.genre || prev.genre,
            description: result.description || prev.description,
            year: result.year || prev.year,
            isbn: result.isbn || prev.isbn,
        }));
    } catch (e) {
        alert("Could not fetch metadata. Please enter manually.");
    } finally {
        setLoadingAutoFill(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
        await uploadBookToCloud(
            file, 
            {
                uploaderId: userId,
                uploaderName: userName,
                ...metadata,
                tags: metadata.tags.split(',').map(t => t.trim()).filter(Boolean),
                chapterCount: metadata.chapterCount ? parseInt(metadata.chapterCount) : undefined
            }, 
            coverFile || undefined
        );
        onSuccess();
        onClose();
    } catch (e) {
        console.error(e);
        alert("Upload failed. Please try again.");
        setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-xl font-serif font-bold text-slate-900">Upload to Library</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-grow">
            <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* File Drop / Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Book File</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${file ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'}`}
                    >
                        {file ? (
                            <div className="flex items-center justify-center gap-3 text-brand-700">
                                <FileText size={24} />
                                <span className="font-medium truncate">{file.name}</span>
                                <span className="text-xs bg-brand-200 px-2 py-0.5 rounded-full text-brand-800">
                                    {(file.size / (1024*1024)).toFixed(1)} MB
                                </span>
                            </div>
                        ) : (
                            <div className="text-slate-500">
                                <Upload className="mx-auto mb-2 text-slate-400" size={24} />
                                <p className="text-sm font-medium">Click to browse or drag file</p>
                                <p className="text-xs mt-1">PDF, EPUB, MOBI, TXT supported</p>
                            </div>
                        )}
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".pdf,.epub,.mobi,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cover Image Column */}
                    <div className="md:col-span-1 space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Cover Image <span className="text-slate-400 font-normal text-xs">(Optional)</span></label>
                        <div 
                            onClick={() => coverInputRef.current?.click()}
                            className="aspect-[2/3] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:opacity-90 relative group"
                        >
                            {previewCover ? (
                                <img src={previewCover} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon size={24} className="mb-1" />
                                    <span className="text-xs">Upload Cover</span>
                                </div>
                            )}
                            <input 
                                ref={coverInputRef}
                                type="file" 
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Metadata Column */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Auto Fill Section */}
                        <div className="flex gap-2">
                            <div className="flex-grow space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">ISBN / Title</label>
                                <input 
                                    type="text" 
                                    value={metadata.isbn} 
                                    onChange={e => setMetadata({...metadata, isbn: e.target.value})}
                                    placeholder="Enter ISBN or Title for auto-fill"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button 
                                    type="button" 
                                    onClick={handleAutoFill} 
                                    disabled={loadingAutoFill}
                                    variant="secondary"
                                    className="h-[38px] text-xs px-3"
                                >
                                    {loadingAutoFill ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} className="mr-1.5" /> Auto-Fill</>}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Book Title</label>
                            <input 
                                type="text" 
                                value={metadata.title}
                                onChange={e => setMetadata({...metadata, title: e.target.value})}
                                required
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Author</label>
                                <input 
                                    type="text" 
                                    value={metadata.author}
                                    onChange={e => setMetadata({...metadata, author: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Year</label>
                                <input 
                                    type="text" 
                                    value={metadata.year}
                                    onChange={e => setMetadata({...metadata, year: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* New Metadata Fields: Series & Chapter Count */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Series Name</label>
                                <input 
                                    type="text" 
                                    value={metadata.seriesName}
                                    onChange={e => setMetadata({...metadata, seriesName: e.target.value})}
                                    placeholder="e.g. Harry Potter"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Chapter Count</label>
                                <input 
                                    type="number" 
                                    value={metadata.chapterCount}
                                    onChange={e => setMetadata({...metadata, chapterCount: e.target.value})}
                                    placeholder="e.g. 12"
                                    min="0"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Genre</label>
                                <input 
                                    type="text" 
                                    value={metadata.genre}
                                    onChange={e => setMetadata({...metadata, genre: e.target.value})}
                                    list="genres"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <datalist id="genres">
                                    <option value="Fiction" />
                                    <option value="Non-Fiction" />
                                    <option value="Sci-Fi" />
                                    <option value="Fantasy" />
                                    <option value="Mystery" />
                                    <option value="Biography" />
                                    <option value="Technology" />
                                </datalist>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Language</label>
                                <select 
                                    value={metadata.language}
                                    onChange={e => setMetadata({...metadata, language: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                >
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                    <option>German</option>
                                    <option>Chinese</option>
                                    <option>Japanese</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Summary / Description</label>
                    <textarea 
                        value={metadata.description}
                        onChange={e => setMetadata({...metadata, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    ></textarea>
                </div>
                
                 <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Tags (comma separated)</label>
                    <input 
                        type="text" 
                        value={metadata.tags}
                        onChange={e => setMetadata({...metadata, tags: e.target.value})}
                        placeholder="e.g. classic, bestseller, summer read"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                </div>

            </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
            <Button variant="secondary" onClick={onClose} disabled={isUploading}>Cancel</Button>
            <Button 
                type="submit" 
                form="upload-form" 
                isLoading={isUploading}
                disabled={!file}
            >
                Upload Book
            </Button>
        </div>
      </div>
    </div>
  );
};