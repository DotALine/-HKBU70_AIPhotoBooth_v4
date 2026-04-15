
import React from 'react';
import { BackgroundScene } from '../types';
import { CheckCircle, ImageOff } from 'lucide-react';

// Using direct download links for Google Drive IDs
export const DEFAULT_BACKGROUNDS: BackgroundScene[] = [
  {
    id: 'hk-baptist-campus',
    name: 'Hong Kong Baptist College Campus',
    url: 'https://cdn.phototourl.com/free/2026-03-26-883b6a71-1ec6-41c2-9a76-2f60c7637f15.jpg',
    prompt: 'Match the lighting, people positioning, and vintage effect of the Hong Kong Baptist College Campus Sample. The subjects should look like they were part of the original vintage photograph.'
  },
  {
    id: 'academic-hall',
    name: 'Academic Community Hall',
    url: 'https://www.image2url.com/r2/default/images/1776171481277-66ac33b3-db7e-49fb-b995-528da9ebc3e4.jpeg',
    prompt: 'The people in the image should appear as if they are taking a selfie. Apply a yellowish, vintage color tone to the people to match the background aesthetic.'
  },
  {
    id: 'campus-1980s',
    name: 'Hong Kong Baptist College Campus in 1980s',
    url: 'https://cdn.phototourl.com/free/2026-03-26-0ecad0a4-81ac-4e93-953a-5c815e5c8d61.jpg',
    prompt: 'Apply a muted, slightly warm color cast typical of aged color film or a scanned vintage photograph: desaturated creams, browns, and warm greys should dominate. Concrete surfaces should be warm grey to beige with weathered darker streaks and stains. Accents of mustard-yellow/tan on walls and vertical cylinders. Vegetation should be muted green. The people should match this vintage, desaturated aesthetic perfectly.'
  },
  {
    id: 'cs-tse-hall',
    name: 'C. S. Tse Memorial Hall',
    url: 'https://cdn.phototourl.com/free/2026-04-14-a52f7815-105c-4e26-8a7f-1087782e29ed.jpg',
    prompt: 'The people should be cropped to half-body, standing, and facing the camera directly.'
  },
  {
    id: 'low-rise-buildings',
    name: 'Low-Rise Buildings (R1 & R2)',
    url: 'https://cdn.phototourl.com/free/2026-03-26-70d787f0-2a62-4298-bda4-bd4cc179bf2c.jpg',
    prompt: 'Ensure the people are scaled and lit naturally to match the low-rise building environment.'
  },
  {
    id: 'indoor-sports-ground',
    name: 'Renfrew Road Campus Indoor Sports Ground (Hut 3)',
    url: 'https://cdn.phototourl.com/free/2026-03-26-9477353c-e6b6-469a-a069-51535682f40e.jpg',
    prompt: 'Match the indoor lighting and sports ground environment for a realistic composite.'
  }
];

interface BackgroundSelectorProps {
  scenes: BackgroundScene[];
  selectedId: string | null;
  onSelect: (scene: BackgroundScene) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ 
  scenes, 
  selectedId, 
  onSelect
}) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenes.map((scene) => (
          <div 
            key={scene.id}
            onClick={() => onSelect(scene)}
            className={`group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
              selectedId === scene.id 
                ? 'ring-4 ring-[#0070c0] scale-[1.02] shadow-xl shadow-[#0070c0]/20' 
                : 'hover:scale-[1.02] hover:shadow-lg bg-gray-50'
            }`}
          >
          <img 
            src={scene.url} 
            alt={scene.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              // Fallback if Drive link fails or is private
              e.currentTarget.src = "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=1000&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
            <h3 className="text-white font-bold text-[14px]">{scene.name}</h3>
            <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
              {scene.description}
            </p>
          </div>
          
          {selectedId === scene.id && (
            <div className="absolute top-3 right-3 bg-[#0070c0] text-white p-1 rounded-full shadow-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  );
};
