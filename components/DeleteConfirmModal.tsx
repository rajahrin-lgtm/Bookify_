import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  bookTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  bookTitle, 
  onConfirm, 
  onCancel,
  isDeleting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">Delete Book?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-900">"{bookTitle}"</span>? 
                This will <span className="text-red-600 font-medium">permanently remove</span> it from the library and storage. This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
                <button 
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                    {isDeleting ? (
                        <>
                           <Loader2 className="animate-spin" size={16} />
                           Deleting...
                        </>
                    ) : 'Delete Forever'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};