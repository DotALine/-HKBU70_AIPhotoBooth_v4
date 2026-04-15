
import React, { useRef, useState, useEffect } from 'react';
import { Coordinate } from '../types';
import { MapPin } from 'lucide-react';

interface InteractiveCanvasProps {
  backgroundUrl: string;
  onPositionSelected: (coord: Coordinate) => void;
  selectedCoordinate: Coordinate | null;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ 
  backgroundUrl, 
  onPositionSelected, 
  selectedCoordinate 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imgRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const img = imgRef.current;
    
    // Get natural dimensions
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    
    // Calculate display dimensions of the image inside object-contain
    const containerRatio = rect.width / rect.height;
    const imgRatio = nw / nh;
    
    let displayWidth, displayHeight, offsetX, offsetY;
    
    if (imgRatio > containerRatio) {
      // Pillarbox (image is wider than container ratio)
      displayWidth = rect.width;
      displayHeight = rect.width / imgRatio;
      offsetX = 0;
      offsetY = (rect.height - displayHeight) / 2;
    } else {
      // Letterbox (image is taller than container ratio)
      displayHeight = rect.height;
      displayWidth = rect.height * imgRatio;
      offsetY = 0;
      offsetX = (rect.width - displayWidth) / 2;
    }
    
    // Click coordinates relative to the container
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Click coordinates relative to the actual image content
    const relativeX = clickX - offsetX;
    const relativeY = clickY - offsetY;
    
    // Check if click is within image bounds
    if (relativeX >= 0 && relativeX <= displayWidth && relativeY >= 0 && relativeY <= displayHeight) {
      const xPercent = (relativeX / displayWidth) * 100;
      const yPercent = (relativeY / displayHeight) * 100;
      
      const pixelX = Math.round((relativeX / displayWidth) * nw);
      const pixelY = Math.round((relativeY / displayHeight) * nh);
      
      onPositionSelected({ 
        x: xPercent, 
        y: yPercent, 
        pixelX, 
        pixelY,
        imageWidth: nw,
        imageHeight: nh
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-[14px] font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#215097]" />
          Click where people should stand
        </h3>
        {selectedCoordinate && (
            <span className="text-sm text-[#215097] font-mono font-medium bg-[#215097]/10 px-2 py-1 rounded">
                X: {selectedCoordinate.pixelX}px, Y: {selectedCoordinate.pixelY}px
            </span>
        )}
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl cursor-crosshair border border-gray-200 bg-gray-100 group"
        onClick={handleClick}
      >
        <img 
          ref={imgRef}
          src={backgroundUrl} 
          alt="Scene Background" 
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />

        {/* Selected Marker */}
        {selectedCoordinate && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out"
            style={{ 
              left: `${selectedCoordinate.x}%`, 
              top: `${selectedCoordinate.y}%` 
            }}
          >
            <div className="relative">
                <MapPin className="w-10 h-10 text-[#215097] fill-[#215097] drop-shadow-lg filter" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/30 blur-[2px] rounded-full" />
            </div>
          </div>
        )}
      </div>
      
      <p className="text-center text-gray-500 text-sm">
        The AI will blend lighting and perspective based on this location.
      </p>
    </div>
  );
};
