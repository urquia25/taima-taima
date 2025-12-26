
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Palette, RotateCcw, ChevronLeft, CheckCircle, Sparkles, Info, Loader2, AlertCircle } from 'lucide-react';
import { ESPECIES, COLORS, BRUSH_SIZES } from '../constants';
import { Species } from '../types';
import { getSpeciesFact, getArtFeedback } from '../services/geminiService';

interface PaleoArtModuleProps {
  onBack: () => void;
  onFinish: (xp: number) => void;
}

const PaleoArtModule: React.FC<PaleoArtModuleProps> = ({ onBack, onFinish }) => {
  const [selected, setSelected] = useState<Species>(ESPECIES[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLORS[4]);
  const [size, setSize] = useState(BRUSH_SIZES[1]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [fact, setFact] = useState<string>("");
  const [loadingFact, setLoadingFact] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100, visible: false });

  // Filtro de umbral adaptativo para convertir fotos en máscaras de coloreado
  const applyAdaptiveThreshold = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // 1. Convertir a blanco y negro y calcular luminancia media
      let totalLuminance = 0;
      for (let i = 0; i < data.length; i += 4) {
        const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        totalLuminance += luminance;
      }
      const avgLuminance = totalLuminance / (data.length / 4);
      const threshold = avgLuminance * 0.95; // Ajuste fino del umbral

      // 2. Aplicar umbral binario para la máscara
      for (let i = 0; i < data.length; i += 4) {
        const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        
        if (luminance < threshold) {
          // Sujeto (Negro opaco para la máscara)
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
        } else {
          // Fondo (Transparente)
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // 3. Crear guía visual para el niño (gris oscuro sobre fondo claro)
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = '#6B7280'; // Gray-500: Muy visible
      ctx.fillRect(0, 0, width, height);
      
      // Volver a modo normal para el dibujo del usuario
      ctx.globalCompositeOperation = 'source-over';
    } catch (e) {
      console.error("Error de seguridad al acceder a los píxeles (CORS):", e);
      throw new Error("La seguridad del navegador impidió procesar esta imagen.");
    }
  };

  const loadSilhouette = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    setLoadingImage(true);
    setError(null);

    const img = new Image();
    // Aseguramos que el parámetro de cache bust no rompa la URL existente
    const separator = selected.silueta.includes('?') ? '&' : '?';
    const finalUrl = `${selected.silueta}${separator}cb=${Date.now()}`;
    
    // Configuración crítica de CORS para permitir manipulación de píxeles en Canvas
    img.crossOrigin = "anonymous";
    img.src = finalUrl;

    img.onload = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const padding = 150;
      const scale = Math.min((canvas.width - padding) / img.width, (canvas.height - padding) / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      try {
        applyAdaptiveThreshold(ctx, canvas.width, canvas.height);
        setLoadingImage(false);
      } catch (err: any) {
        setError(err.message || "Error al procesar la silueta.");
        setLoadingImage(false);
      }
    };

    img.onerror = () => {
      console.error("Error al cargar la imagen desde el servidor:", finalUrl);
      setError("El servidor de imágenes no responde correctamente. Prueba con otra especie.");
      setLoadingImage(false);
    };
  }, [selected]);

  useEffect(() => {
    loadSilhouette();
    setFact("");
  }, [loadSilhouette]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, rawX: 0, rawY: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: rawX * scaleX,
      y: rawY * scaleY,
      rawX,
      rawY
    };
  };

  const handleStartDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (loadingImage || error) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.globalCompositeOperation = 'source-atop'; 
    setIsDrawing(true);
  };

  const handleDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y, rawX, rawY } = getCoordinates(e);
    setCursorPos({ x: rawX, y: rawY, visible: true });

    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const fetchFact = async () => {
    setLoadingFact(true);
    const data = await getSpeciesFact(selected.nombre);
    setFact(data);
    setLoadingFact(false);
  };

  const handleFinish = async () => {
    setShowFinishModal(true);
    const msg = await getArtFeedback(selected.nombre);
    setFeedback(msg);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {/* Navegación y Selección */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 font-black text-orange-600 hover:scale-105 transition-all bg-white px-6 py-3 rounded-[2rem] shadow-md border border-orange-100 uppercase text-xs"
        >
          <ChevronLeft size={18} strokeWidth={3} /> MAPA DE AVENTURAS
        </button>
        
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
          {ESPECIES.map(esp => (
            <button
              key={esp.id}
              onClick={() => setSelected(esp)}
              className={`px-5 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-tighter whitespace-nowrap transition-all border-b-4 ${
                selected.id === esp.id 
                  ? 'bg-orange-500 text-white shadow-lg border-orange-700 -translate-y-1' 
                  : 'bg-white text-gray-400 border-gray-100 hover:bg-orange-50'
              }`}
            >
              {esp.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel Lateral */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-b-[10px] border-gray-100 flex flex-col gap-8">
            <section>
              <p className="text-[10px] font-black text-gray-400 mb-4 tracking-[0.2em] uppercase">Control Artístico</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-purple-600 text-white p-4 rounded-[2rem] shadow-lg flex flex-col items-center hover:bg-purple-700 transition-all active:scale-90">
                  <Palette size={24} />
                  <span className="text-[9px] mt-2 font-black uppercase">Pincel</span>
                </button>
                <button 
                  onClick={loadSilhouette}
                  className="bg-gray-100 text-gray-400 p-4 rounded-[2rem] flex flex-col items-center hover:bg-gray-200 transition-all active:scale-90"
                >
                  <RotateCcw size={24} />
                  <span className="text-[9px] mt-2 font-black uppercase">Limpiar</span>
                </button>
              </div>
            </section>

            <section>
              <p className="text-[10px] font-black text-gray-400 mb-4 tracking-[0.2em] uppercase">Grosor</p>
              <div className="flex justify-between items-center bg-gray-50 p-5 rounded-[2rem]">
                {BRUSH_SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-full bg-slate-800 transition-all ${size === s ? 'scale-150 ring-4 ring-orange-200 shadow-md' : 'opacity-20 hover:opacity-100'}`}
                    style={{ width: `${s/1.5}px`, height: `${s/1.5}px` }}
                  />
                ))}
              </div>
            </section>

            <section>
              <p className="text-[10px] font-black text-gray-400 mb-4 tracking-[0.2em] uppercase">Colores</p>
              <div className="grid grid-cols-4 gap-3">
                {COLORS.map(c => (
                  <button 
                    key={c} 
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-125 active:scale-90 shadow-sm ${color === c ? 'border-orange-500 scale-125 shadow-md z-10' : 'border-white'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </section>
          </div>

          <div className="bg-orange-50 p-6 rounded-[2.5rem] border-b-[8px] border-orange-100">
             <button 
                onClick={fetchFact}
                disabled={loadingFact}
                className="w-full flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-black py-4 rounded-[1.5rem] shadow-md transition-all active:scale-95 disabled:opacity-50"
             >
               <Sparkles size={18} className={loadingFact ? 'animate-spin' : ''} />
               {loadingFact ? 'INVESTIGANDO...' : 'DATO DE TAIMI'}
             </button>
             {fact && (
               <div className="mt-4 animate-in slide-in-from-top-4 duration-500 bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
                 <p className="text-[11px] font-bold text-orange-800 leading-tight italic">
                   "{fact}"
                 </p>
               </div>
             )}
          </div>
        </div>

        {/* Lienzo Principal */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="relative group overflow-hidden rounded-[4rem] bg-white shadow-2xl border-[16px] border-white" style={{ cursor: 'none' }}>
            <div className="absolute top-10 left-10 z-10 pointer-events-none">
                <span className="bg-purple-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl">
                  {selected.nombre}
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-800 mt-4 filter drop-shadow-md tracking-tighter">
                  Coloréame
                </h2>
                <p className="text-xs font-black text-slate-400 italic tracking-wide mt-1">{selected.cientifico}</p>
            </div>
            
            {loadingImage && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <Loader2 size={48} className="text-orange-500 animate-spin mb-4" />
                <p className="text-orange-900 font-black uppercase tracking-widest text-sm text-center px-4">Invocando al gigante desde el pasado...</p>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-orange-50/90 text-center px-10">
                <AlertCircle size={64} className="text-orange-600 mb-4" />
                <h3 className="text-2xl font-black text-orange-900 mb-2">¡Oops! Algo falló</h3>
                <p className="text-orange-800 font-bold max-w-sm">{error}</p>
                <button onClick={loadSilhouette} className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-3 rounded-2xl shadow-lg mt-6 transition-all active:scale-95">
                  INTENTAR DE NUEVO
                </button>
              </div>
            )}

            <canvas 
                ref={canvasRef}
                width={1000}
                height={650}
                onMouseDown={handleStartDraw}
                onMouseMove={handleDraw}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => {
                  setIsDrawing(false);
                  setCursorPos(prev => ({ ...prev, visible: false }));
                }}
                onMouseEnter={() => setCursorPos(prev => ({ ...prev, visible: true }))}
                onTouchStart={handleStartDraw}
                onTouchMove={handleDraw}
                onTouchEnd={() => setIsDrawing(false)}
                className="w-full h-[400px] md:h-[650px] transition-all bg-[#FAFAFA] touch-none"
            />

            {/* Pincel Visual */}
            {cursorPos.visible && !loadingImage && !error && (
              <div 
                className="pointer-events-none absolute z-[99] transition-transform duration-[40ms] ease-out"
                style={{ 
                  left: cursorPos.x, 
                  top: cursorPos.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div 
                  className="rounded-full border-[3px] border-white shadow-2xl opacity-80"
                  style={{ 
                    width: `${size}px`, 
                    height: `${size}px`, 
                    backgroundColor: color 
                  }}
                />
              </div>
            )}
            
            <div className="absolute bottom-10 right-10 flex gap-4">
              <button 
                onClick={handleFinish}
                disabled={loadingImage || !!error}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-black px-12 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-3 transition-all active:scale-95 group border-b-[8px] border-green-700"
              >
                <CheckCircle size={28} className="group-hover:animate-bounce" />
                <span className="text-lg uppercase">¡TERMINÉ!</span>
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-8 rounded-[3rem] border-l-[12px] border-blue-400 flex items-center gap-6 shadow-sm">
            <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-lg shrink-0">
              <Info size={32} strokeWidth={3} />
            </div>
            <div>
              <h4 className="font-black text-blue-900 text-lg uppercase tracking-tight">Estudio de Paleo-Arte</h4>
              <p className="text-sm text-blue-700 font-bold leading-relaxed opacity-80">
                La silueta gris marca la forma real del animal. ¡Usa tus colores mágicos! Tu pincel solo funcionará dentro de la silueta.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Finalización */}
      {showFinishModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white rounded-[5rem] p-12 max-w-lg w-full shadow-2xl border-b-[20px] border-orange-500 transform animate-in zoom-in-90 duration-500 text-center">
            <div className="w-32 h-32 bg-yellow-400 rounded-full mx-auto mb-8 flex items-center justify-center text-6xl shadow-2xl border-8 border-white animate-bounce">
              🏆
            </div>
            <h3 className="text-4xl font-black text-slate-800 mb-6 tracking-tight">¡QUÉ ARTE!</h3>
            <div className="bg-orange-50 p-8 rounded-[3rem] mb-10 border-2 border-orange-100 relative">
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-200 text-orange-800 text-[10px] font-black px-4 py-1 rounded-full uppercase">
                 Taimi te felicita:
               </div>
               <p className="text-orange-900 font-black text-lg italic leading-tight">
                "{feedback || "¡Eres un gran artista de la prehistoria!"}"
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => onFinish(150)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl text-2xl flex items-center justify-center gap-3 transition-all active:scale-95 border-b-[8px] border-orange-700"
              >
                CANJEAR +150 XP
              </button>
              <button 
                onClick={() => setShowFinishModal(false)}
                className="text-slate-400 font-black uppercase text-xs tracking-widest mt-2 hover:text-slate-600 transition-colors"
              >
                Seguir pintando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaleoArtModule;
