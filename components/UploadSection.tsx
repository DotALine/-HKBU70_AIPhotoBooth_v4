
import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Image as ImageIcon, ArrowRight, RefreshCcw, ShieldCheck, UserPlus, Square, CheckSquare } from 'lucide-react';
import { validateHumanPresence } from '../services/geminiService';
import { Button } from './Button';
import { TermsModal } from './TermsModal';

interface UploadSectionProps {
  onImageVerified: (base64: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onImageVerified }) => {
  const [hasConsented, setHasConsented] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasDeclined, setHasDeclined] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedPreview, setVerifiedPreview] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file.");
      return;
    }
    setIsValidating(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const result = await validateHumanPresence(base64);
        if (result.valid) {
          setVerifiedPreview(base64);
        } else {
          setError(result.reason || "We cannot detect any people in this photo.");
        }
      } catch (err) {
        setError("There is an error verifying your photo.");
      } finally {
        setIsValidating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  }, []);

  if (!hasConsented) {
    return (
      <div className="w-full p-8 text-[#10223d]">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#10223d]">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-[1.2rem] md:text-[1.5rem] font-black uppercase font-poppins text-[#10223d]">Terms and Conditions</h3>
          <h3 className="text-[1rem] md:text-[1.1rem] font-semibold font-poppins text-[#10223d]">For Using HKBU 70th Anniversary AI Photo Booth</h3>
          
          <div className="my-8 flex items-start gap-3 text-left max-w-sm">
            <button 
              onClick={() => setIsAgreed(!isAgreed)}
              className={`mt-1 flex-shrink-0 transition-colors ${isAgreed ? 'text-[#0070c0]' : 'text-gray-300 hover:text-gray-400'}`}
            >
              {isAgreed ? <CheckSquare size={24} /> : <Square size={24} />}
            </button>
            <p className="text-[14px] font-poppins text-hkbu-navy/80 leading-relaxed">
              I agree to the <button onClick={() => setIsTermsModalOpen(true)} className="text-[#0070c0] font-bold underline hover:text-[#005a9c] transition-colors">Terms and Conditions</button> for using the HKBU 70th Anniversary AI Photo Booth.
            </p>
          </div>

          {hasDeclined && !isAgreed && (
            <p className="text-red-500 font-bold text-center pt-2 animate-shake text-[14px] mb-4">You must accept the terms to use the AI Photobooth</p>
          )}

          <div className="flex flex-col w-full gap-3">
            <Button 
              onClick={() => {
                if (isAgreed) {
                  setHasConsented(true);
                } else {
                  setHasDeclined(true);
                }
              }} 
              className={`w-full h-14 font-poppins font-bold text-[14px] ${!isAgreed ? 'opacity-50 cursor-not-allowed' : ''}`} 
              variant="primary"
              disabled={!isAgreed}
            >
              Accept and Proceed
            </Button>
            <button 
              onClick={() => setHasDeclined(true)} 
              className="text-hkbu-navy/40 hover:text-hkbu-navy/60 font-medium transition-colors text-[14px]"
            >
              Decline
            </button>
          </div>
        </div>
        <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
      </div>
    );
  }

  if (verifiedPreview) {
    return (
      <div className="w-full p-8 space-y-6 text-[#215097]">
        <div className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-2xl font-bold text-[24px]">
          <CheckCircle /> Photo Verified
        </div>
        <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-gray-100 shadow-xl">
          <img src={verifiedPreview} className="w-full h-full object-cover" />
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setVerifiedPreview(null)} className="flex-1">Retry</Button>
          <Button variant="primary" onClick={() => onImageVerified(verifiedPreview)} className="flex-1">Continue <ArrowRight size={20} /></Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative border-2 border-dashed rounded-[2rem] p-12 transition-all duration-300 ${isDragging ? 'border-hkbu-navy bg-blue-50 scale-95' : 'border-gray-200 bg-white hover:border-hkbu-navy'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} disabled={isValidating} />
      <div className="flex flex-col items-center gap-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isValidating ? 'bg-hkbu-navy text-white animate-spin' : 'bg-gray-100 text-hkbu-navy'}`}>
          {isValidating ? <RefreshCcw size={32} /> : <UserPlus size={32} />}
        </div>
        <div className="text-center">
          <h3 className="text-[1.2rem] md:text-[1.5rem] font-poppins font-bold text-[#10223d]">{isValidating ? "Validating..." : "Upload Your Photo"}</h3>
          <p className="text-gray-400 font-medium mt-1 text-[14px]">Drag and drop or click to browse</p>
        </div>
        {!isValidating && <div className="bg-[#215097] text-white px-8 py-2 rounded-full font-roboto font-bold text-[14px]">Select Image</div>}
      </div>
      {error && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-[14px] font-bold">{error}</div>}
    </div>
  );
};
