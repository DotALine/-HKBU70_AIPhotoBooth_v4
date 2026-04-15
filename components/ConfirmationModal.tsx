
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  message 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-hkbu-cream rounded-[2.5rem] p-10 max-w-md w-full shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] border-4 border-white scale-in">
        <p className="text-hkbu-navy text-[36px] font-serif font-bold text-center mb-10 leading-relaxed">
          {message}
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={onConfirm}
            className="w-full py-4 px-8 rounded-full font-black bg-hkbu-navy text-white hover:bg-hkbu-navy/90 transition-all shadow-lg active:scale-95 text-[14px]"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 px-8 rounded-full font-bold text-hkbu-navy/40 hover:text-hkbu-navy/60 transition-colors text-[14px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
