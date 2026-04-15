
import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-[1.2rem] md:text-[1.5rem] font-bold text-[#10223d]">Terms and Conditions</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto font-poppins text-hkbu-navy/80 space-y-6 text-[14px] leading-relaxed">
          <p className="font-bold text-[16px]">HKBU 70th Anniversary AI Photo Booth Terms of Use</p>
          
          <p>By accessing, browsing or using HKBU 70th Anniversary AI Photo Booth (the "AI Photo Booth"), you agree to be unconditionally bound by the following terms and conditions:</p>
          
          <p>
            <strong>Photo Upload:</strong> You may upload photos and/or images of yourself and/or other persons who have consented to permit you to upload the photos in the AI Photo Booth. You further confirm that you have the copyright in any images, photographs that you upload to the AI Photo Booth and/or have the right to grant the licence to HKBU to process the photos or images in the AI Photo Booth.
          </p>
          
          <p>
            <strong>AI Processing:</strong> The AI will automatically remove the background and any existing watermarks from your uploaded photo to create a composite scene (the "Generated Photos").
          </p>
          
          <p>
            <strong>Data Privacy:</strong> Your images are processed in real-time. We do not store or retain a copy of your original uploaded photo and the Generated Photos. Please be reminded to download the Generated Photos immediately should you intend to retain a copy thereof. We do not collect a copy of or retain any of the uploaded photos and the Generated Photos.
          </p>
          
          <p>
            <strong>Watermarking:</strong> A transparent commemorative watermark will be added to the Generated Photos.
          </p>
          
          <p>
            <strong>Usage Rights:</strong> The Generated Photos are for personal, non-commercial use to celebrate the HKBU 70th Anniversary. If you wish to use the Generated Photos, you must include the watermarking. Any use beyond the scope stated above shall require prior written permission from HKBU.
          </p>
          
          <p>
            You shall not alter, edit, deform or otherwise modify the Generated Photos or use the Generated Photos in any manner that is defamatory, obscene, offensive, infringing, misleading, jeopardising the reputation of HKBU or cause embarrassment to HKBU or otherwise unlawful.
          </p>
          
          <p>
            <strong>Others:</strong> HKBU does not warrant that the AI Photo Booth or any of its associated content, features or services will be uninterrupted, error-free, secure, or free of viruses or delays. You acknowledge that data transmission over the internet and information storage technologies inherently involve security risks. HKBU expressly disclaims liability for any interruptions, failures, errors, security incidents, or delays in the operation of the AI Photo Booth.
          </p>
          
          <p>
            You may not use the AI Photo Booth in violation of applicable laws or in violation of our or any third party's intellectual property or other legal rights.
          </p>
          
          <p>
            You further agree that you shall not attempt or support any third party's attempt to circumvent, reverse engineer, dissemble, decompile, decrypt or otherwise alter or interfere with the AI Photo Booth, any content thereof, or make any unauthorised use thereof.
          </p>
          
          <p>
            HKBU is not responsible for any misuse of the Generated Photos or any issues arising from the content of uploaded photos.
          </p>
          
          <div className="space-y-2">
            <p className="font-bold">General</p>
            <p>Words in the singular shall include the plural and vice versa.</p>
            <p>All headings shall not affect the interpretation of these terms and conditions.</p>
          </div>
          
          <div className="space-y-2">
            <p className="font-bold">Governing Law</p>
            <p>These terms and conditions are governed by the laws of the Hong Kong Special Administrative Region.</p>
          </div>
          
          <p className="pt-4 font-medium italic">Please ensure you have read and understood these terms and conditions before accessing the AI Photo Booth.</p>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <Button onClick={onClose} variant="primary" className="px-8 rounded-full">Close</Button>
        </div>
      </div>
    </div>
  );
};
