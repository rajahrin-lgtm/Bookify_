import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-[70] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-fade-in-up ${
        type === 'success' 
            ? 'bg-white border-green-100 text-green-800' 
            : 'bg-white border-red-100 text-red-800'
    }`}>
      {type === 'success' ? <CheckCircle size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
        <X size={14} className="text-slate-400" />
      </button>
    </div>
  );
};