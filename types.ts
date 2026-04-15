
export interface Coordinate {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  pixelX: number; // absolute pixel coordinate
  pixelY: number; // absolute pixel coordinate
  imageWidth: number; // natural width of the background image
  imageHeight: number; // natural height of the background image
}

export interface BackgroundScene {
  id: string;
  name: string;
  url: string;
  description?: string;
  category?: string;
  prompt?: string;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  SELECT_BACKGROUND = 'SELECT_BACKGROUND',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
}

export interface ProcessingError {
  message: string;
  type: 'validation' | 'generation' | 'network';
}
