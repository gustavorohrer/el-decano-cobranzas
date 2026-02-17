
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen, title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar",
  onConfirm, onCancel, type = 'danger'
}) => {
  if (!isOpen) return null;

  const colorClasses = {
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200',
    info: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
  };

  const iconClasses = {
    danger: 'text-red-600 bg-red-50',
    warning: 'text-yellow-600 bg-yellow-50',
    info: 'text-indigo-600 bg-indigo-50'
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-4 rounded-full ${iconClasses[type]}`}>
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{message}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full pt-4">
            <button 
              onClick={onCancel}
              className="py-3.5 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={onConfirm}
              className={`py-3.5 ${colorClasses[type]} font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:-translate-y-0.5`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
