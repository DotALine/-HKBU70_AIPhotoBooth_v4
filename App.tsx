import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UploadSection } from './components/UploadSection';
import { BackgroundSelector, DEFAULT_BACKGROUNDS } from './components/BackgroundSelector';
import { Button } from './components/Button';
import { generateCompositeScene } from './services/geminiService';
import { addWatermarkToImage, fetchWithResilientProxy } from './services/imageUtils';
import { AppState, BackgroundScene } from './types';
import { Layers, Wand2, Download, ArrowRight, Sparkles, Image as ImageIcon, Menu, X, Upload } from 'lucide-react';

// ============================================================================
// APP CONSTANTS & TYPES
// ============================================================================
const LOGO_HKBU_URL = "https://image2url.com/images/1765897606349-3c07426e-b3de-4602-ac23-7ababd2c8d73.svg";
const LOGO_70TH_URL = "https://image2url.com/images/1765897259008-afc0713c-70b6-4e14-9568-857bc4ff6806.png";
const WATERMARK_URL = "https://image2url.com/r2/default/images/1776170132454-059dc93f-5bdc-4d93-8ca9-98d36097b7d0.png";

const CONFETTI_COLORS = ['#2196f3', '#03a9f4', '#00bcd4', '#ffeb3b', '#ff9800', '#ff5722'];

interface FireworkProps { x: number; y: number; }

const FireworksBurst: React.FC<FireworkProps> = ({ x, y }) => {
  const sparks = Array.from({ length: 20 });
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {sparks.map((_, i) => {
        const isRibbon = i % 2 === 0;
        const angle = (Math.PI * 2 * i) / sparks.length;
        const distance = 50 + Math.random() * 50;
        const size = isRibbon ? (4 + Math.random() * 4) : (6 + Math.random() * 6);
        const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const duration = 0.5 + Math.random() * 1.5;
        return (
          <div
            key={i}
            className="absolute animate-confetti-burst"
            style={{
              left: x,
              top: y,
              width: isRibbon ? `${size}px` : `${size}px`,
              height: isRibbon ? `${size}px` : `${size}px`,
              backgroundColor: color,
              borderRadius: isRibbon ? '2px' : '50%',
              '--dx': `${Math.cos(angle) * distance}px`,
              '--dy': `${Math.sin(angle) * distance}px`,
              '--dr': `${angle * (180 / Math.PI) + (Math.random() * 360)}deg`,
              '--duration': `${duration}s`,
              boxShadow: `0 0 5px ${color}44`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const [showLabels, setShowLabels] = useState(true);
  const ghostRef = useRef<HTMLDivElement>(null);
  const steps = [
    { id: 1, label: 'Upload', icon: <Upload size={16} /> },
    { id: 2, label: 'Background', icon: <Layers size={16} /> },
    { id: 3, label: 'Generate', icon: <Wand2 size={16} /> },
  ];

  useEffect(() => {
    const checkSpace = () => {
      if (ghostRef.current) {
        const margin = 76;
        const ghostWidth = ghostRef.current.offsetWidth;
        setShowLabels(window.innerWidth > ghostWidth + margin);
      }
    };
    checkSpace();
    window.addEventListener('resize', checkSpace);
    window.addEventListener('orientationchange', () => setTimeout(checkSpace, 100));
    return () => {
      window.removeEventListener('resize', checkSpace);
      window.removeEventListener('orientationchange', checkSpace);
    };
  }, []);

  return (
    <>
      <div ref={ghostRef} className="invisible absolute -top-[1000px] left-0 flex items-center gap-6 px-8 py-3 bg-white/80 border border-white/40 rounded-full font-poppins font-bold text-[14px] pointer-events-none whitespace-nowrap">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-hkbu-navy/5">
                {React.cloneElement(step.icon as React.ReactElement, { size: 14 })}
              </div>
              <span>{step.id}. {step.label}</span>
            </div>
            {index < steps.length - 1 && <ArrowRight size={14} />}
          </React.Fragment>
        ))}
      </div>
      <div className={`flex items-center transition-all duration-500 ease-in-out ${showLabels ? 'gap-4 md:gap-6 px-6 md:px-8' : 'gap-2 px-3'} py-2 md:py-3 bg-white/80 backdrop-blur-md border border-white/40 rounded-full shadow-xl mb-8 animate-fade-in`}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`flex items-center transition-all duration-300 ${currentStep === step.id ? 'text-hkbu-navy scale-105 md:scale-110' : 'text-hkbu-navy/30'} ${showLabels ? 'gap-2' : 'gap-1.5'}`}>
              <div className={`p-1 md:p-1.5 rounded-lg ${currentStep === step.id ? 'bg-hkbu-navy text-white shadow-md' : 'bg-hkbu-navy/5'}`}>
                {React.cloneElement(step.icon as React.ReactElement, { size: 14 })}
              </div>
              <span className={`text-[12px] md:text-[14px] font-poppins font-bold whitespace-nowrap`}>
                {step.id}{showLabels && <span>. {step.label}</span>}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="text-hkbu-navy/20">
                <ArrowRight size={showLabels ? 14 : 12} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [backgrounds] = useState<BackgroundScene[]>(() => {
    try {
      const savedScenes = localStorage.getItem('scene_composer_backgrounds');
      return savedScenes ? JSON.parse(savedScenes) : DEFAULT_BACKGROUNDS;
    } catch {
      return DEFAULT_BACKGROUNDS;
    }
  });
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundScene | null>(null);
  const [backgroundBase64, setBackgroundBase64] = useState<string | null>(null);
  const [isLoadingBackground, setIsLoadingBackground] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const previewSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentStep = appState === AppState.UPLOAD ? 1 : appState === AppState.SELECT_BACKGROUND ? 2 : (appState === AppState.GENERATING || appState === AppState.RESULT) ? 3 : 1;

  useEffect(() => {
    if (selectedBackground && backgroundBase64 && !isLoadingBackground && previewSectionRef.current) {
      const timer = setTimeout(() => {
        previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedBackground, backgroundBase64, isLoadingBackground]);

  const handleGlobalClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, input, canvas, .container section');
    if (!isInteractive) {
      const id = Date.now();
      setBursts(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setBursts(prev => prev.filter(b => b.id !== id)), 3000);
    }
  }, []);

  const resetApp = () => {
    setPersonImage(null);
    setSelectedBackground(null);
    setBackgroundBase64(null);
    setGeneratedImage(null);
    setAppState(AppState.UPLOAD);
    setError(null);
    setIsMenuOpen(false);
    setResetKey(prev => prev + 1);
  };

  // Preload background image and convert to Base64
  const handleSelectBackground = async (scene: BackgroundScene) => {
    setSelectedBackground(scene);
    setIsLoadingBackground(true);
    setBackgroundBase64(null);
    setError(null);
    try {
      const url = scene.url;
      if (url.startsWith('data:')) {
        setBackgroundBase64(url);
        return;
      }
      
      // Use resilient proxy system to avoid "Failed to fetch" errors
      const base64 = await fetchWithResilientProxy(url);
      setBackgroundBase64(base64);
    } catch (err: any) {
      console.error("Background preloading error:", err);
      setError(`Failed to load background: ${err.message}`);
      setBackgroundBase64(null);
    } finally {
      setIsLoadingBackground(false);
    }
  };

  const handleGenerate = async () => {
    if (!personImage || !backgroundBase64) {
      setError("Please upload the image and wait for the system to respond.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setAppState(AppState.GENERATING);
    try {
      // 直接使用已经加载好的背景 Base64
      const rawResult = await generateCompositeScene(personImage, backgroundBase64);
      const watermarkedResult = await addWatermarkToImage(rawResult, WATERMARK_URL);
      setGeneratedImage(watermarkedResult);
      setAppState(AppState.RESULT);
    } catch (err: any) {
      console.error("生成错误:", err);
      setError(err.message);
      setAppState(AppState.SELECT_BACKGROUND);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden cursor-default bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: 'url("https://image2url.com/r2/default/images/1772562289078-c67c10bf-2f47-482b-a9dc-11f9e7d00e00.png")',
        backgroundColor: '#ffffff'
      }}
      onClick={handleGlobalClick}
    >
      {bursts.map(b => <FireworksBurst key={b.id} x={b.x} y={b.y} />)}

      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-hkbu-navy/10 px-4 md:px-6 py-3 md:py-4">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-6">
            {windowWidth < 640 && (
              <button
                className="lg:hidden p-2 text-hkbu-navy hover:bg-hkbu-navy/5 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
            <button
              onClick={resetApp}
              className={`${windowWidth < 640 ? 'hidden' : 'block'} font-roboto text-lg md:text-2xl font-bold text-hkbu-navy tracking-tight hover:text-hkbu-navy/70 transition-colors`}
            >
              Main Page
            </button>
            <div className="h-6 md:h-8 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 md:gap-6">
              <img src={LOGO_HKBU_URL} alt="HKBU" className="h-6 md:h-10 w-auto object-contain" />
              <img src={LOGO_70TH_URL} alt="HKBU 70th" className="h-8 md:h-16 w-auto object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {windowWidth >= 640 && (
              <button
                className="lg:hidden p-2 text-hkbu-navy hover:bg-hkbu-navy/5 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-hkbu-navy/10 shadow-xl animate-fade-in overflow-hidden">
            <div className="flex flex-col p-4 gap-2">
              <button onClick={resetApp} className="flex items-center gap-3 px-4 py-3 text-hkbu-navy font-roboto font-bold hover:bg-hkbu-navy/5 rounded-xl transition-colors">
                <ImageIcon size={20} /> Main Page
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-20 relative z-10">
        {appState === AppState.GENERATING ? (
          <div className="max-w-md mx-auto text-center space-y-8 animate-fade-in py-20 bg-white/80 backdrop-blur-md p-10 rounded-[3rem] border border-white/40 shadow-2xl">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-hkbu-navy/10 border-t-hkbu-navy rounded-full animate-spin mx-auto"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-hkbu-navy w-12 h-12 animate-pulse" />
            </div>
            <div className="space-y-3">
              <h2 className="font-poppins text-[1.5rem] font-bold text-[#10223d]">AI is Crafting...</h2>
              <p className="text-hkbu-navy/60 text-[14px] font-medium">Extracting subjects and blending lighting for a perfect scene.</p>
            </div>
          </div>
        ) : appState === AppState.UPLOAD ? (
          <div className="flex flex-col items-center animate-fade-in">
            <Stepper currentStep={currentStep} />
            <div className="text-center mb-16 relative">
              <div className="bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-white/20 shadow-2xl inline-block mx-auto">
                <h1 className="font-poppins text-[1.2rem] md:text-[1.5rem] font-semibold text-[#10223d] mb-4 tracking-tight leading-tight">
                  AI Photo Booth
                </h1>
                <p className="text-hkbu-navy/60 text-[20px] font-medium max-w-2xl mx-auto">
                  Upload a photo of people, choose a background, <br />
                  and generate your anniversary photo.
                </p>
              </div>
            </div>
            <div className="w-full max-w-xl bg-white/80 backdrop-blur-md p-3 rounded-[3rem] shadow-2xl border border-white/20">
              <UploadSection key={resetKey} onImageVerified={(base64) => { setPersonImage(base64); setAppState(AppState.SELECT_BACKGROUND); }} />
            </div>
          </div>
        ) : (
          <div className="space-y-16 flex flex-col items-center">
            <Stepper currentStep={currentStep} />
            <div className="w-full space-y-16">
              {appState === AppState.RESULT && generatedImage ? (
                <div className="max-w-4xl mx-auto text-center space-y-10 animate-scale-in bg-white/80 backdrop-blur-md p-10 rounded-[3rem] border border-white/20 shadow-2xl">
                  <h2 className="font-poppins text-[1.2rem] md:text-[1.5rem] font-bold text-[#10223d]">Creation Complete</h2>
                  <div className="bg-white/60 p-4 rounded-[2.5rem] shadow-2xl border-4 border-white overflow-hidden transform hover:rotate-1 transition-transform">
                    <img src={generatedImage} alt="Result" className="w-full rounded-2xl shadow-inner" />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                    <a href={generatedImage} download="hkbu-photo.png" className="bg-hkbu-navy text-white px-12 py-5 rounded-full font-roboto font-bold text-[14px] flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl">
                      <Download size={24} /> Download
                    </a>
                    <Button onClick={resetApp} variant="secondary" className="px-12 rounded-full font-roboto font-bold text-[14px]">New Session</Button>
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto space-y-12 flex flex-col items-center">
                  <section className="bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-[3rem] shadow-2xl border border-white/20 w-full max-w-5xl">
                    <h2 className="font-poppins text-[1.2rem] md:text-[1.5rem] font-bold text-[#10223d] mb-10 flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-[#10223d] text-white rounded-2xl flex items-center justify-center font-bold shadow-lg transform rotate-3">1</div>
                      Select Background
                    </h2>
                    <BackgroundSelector
                      scenes={backgrounds}
                      selectedId={selectedBackground?.id || null}
                      onSelect={handleSelectBackground}
                    />
                    {isLoadingBackground && <div className="text-center text-gray-500 mt-4">加载背景中...</div>}
                    {error && <div className="text-center text-red-500 mt-4">{error}</div>}
                  </section>

                  {selectedBackground && backgroundBase64 && !isLoadingBackground && (
                    <>
                      <section key={selectedBackground.id} ref={previewSectionRef} className="bg-white/80 backdrop-blur-md p-6 md:p-10 rounded-[3rem] shadow-2xl border border-white/20 w-full max-w-5xl animate-slide-up scroll-mt-28">
                        <h2 className="font-poppins text-[1.2rem] md:text-[1.5rem] font-bold text-[#10223d] mb-6 flex items-center gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#10223d] text-white rounded-2xl flex items-center justify-center font-bold shadow-lg transform -rotate-3">2</div>
                          Preview Selected Background
                        </h2>
                        <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                          <img key={selectedBackground.url} src={selectedBackground.url} alt={selectedBackground.name} className="w-full h-auto object-cover max-h-[60vh] animate-fade-in" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                            <p className="text-white font-bold text-xl">{selectedBackground.name}</p>
                            <p className="text-white/80 text-sm">{selectedBackground.description}</p>
                          </div>
                        </div>
                      </section>

                      <div key={`btn-${selectedBackground.id}`} className="w-full max-w-xs animate-slide-up mt-8">
                        <Button
                          onClick={handleGenerate}
                          disabled={isProcessing}
                          isLoading={isProcessing}
                          className="w-full h-18 rounded-full text-[20px] shadow-2xl bg-gradient-to-r from-hkbu-navy to-hkbu-blue text-white font-black"
                        >
                          Generate Image <Wand2 className="ml-2" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;