
import React from 'react';
import { Palette, Puzzle, BookOpen, Trophy, PlayCircle } from 'lucide-react';
import { ViewState } from '../types';

interface DashboardProps {
  setView: (v: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter mb-4">
          ¡Hola, Explorador! 👋
        </h2>
        <p className="text-lg font-semibold text-slate-500 max-w-2xl leading-relaxed">
          Bienvenido al centro de investigación de Taima Taima. ¿Qué aventura prehistórica quieres comenzar hoy?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card 
          title="Galería Creativa" 
          desc="Dale color a los gigantes del Pleistoceno usando pigmentos milenarios." 
          icon={<Palette size={48}/>} 
          color="bg-purple-500" 
          border="border-purple-600"
          onClick={() => setView('art')}
          badge="Popular"
        />
        <Card 
          title="Excavación 3D" 
          desc="Desentierra huesos y arma esqueletos completos de megafauna." 
          icon={<Puzzle size={48}/>} 
          color="bg-orange-500" 
          border="border-orange-600"
          locked 
        />
        <Card 
          title="Relatos de Cueva" 
          desc="Escucha las historias de cómo vivían los primeros humanos en Falcón." 
          icon={<BookOpen size={48}/>} 
          color="bg-blue-500" 
          border="border-blue-600"
          locked 
        />
      </div>

      <div className="mt-16 bg-yellow-50 rounded-[4rem] p-10 border-4 border-yellow-200 border-dashed relative overflow-hidden group">
         <div className="absolute -right-10 -bottom-10 text-yellow-200 opacity-30 transform group-hover:scale-110 transition-transform">
           <Trophy size={200} />
         </div>
         <div className="relative z-10">
           <span className="bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-sm">
             Reto Semanal
           </span>
           <h3 className="text-3xl font-black text-yellow-900 mb-2 italic">¡El Regreso del Gran Mastodonte!</h3>
           <p className="text-yellow-800 font-bold mb-6 max-w-xl opacity-80">
             Completa 3 dibujos de diferentes especies y gana la medalla especial "Investigador de Falcón".
           </p>
           <button className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black px-8 py-4 rounded-3xl shadow-lg flex items-center gap-2 transition-all active:scale-95">
             <PlayCircle size={20} /> COMENZAR RETO
           </button>
         </div>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  onClick?: () => void;
  locked?: boolean;
  badge?: string;
}

const Card: React.FC<CardProps> = ({ title, desc, icon, color, border, onClick, locked = false, badge }) => {
  return (
    <div 
      onClick={!locked ? onClick : undefined}
      className={`${color} ${locked ? 'opacity-60 grayscale' : 'hover:-translate-y-3 cursor-pointer'} p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden transition-all duration-500 border-b-[12px] ${border} group`}
    >
      {badge && !locked && (
        <span className="absolute top-6 right-8 bg-white/30 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase backdrop-blur-md">
          {badge}
        </span>
      )}
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="bg-white/20 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 backdrop-blur-md group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-3xl font-black mb-4 tracking-tighter leading-tight">{title}</h3>
        <p className="text-white/80 font-bold text-sm leading-relaxed flex-grow">{desc}</p>
        
        {locked && (
          <div className="mt-6 flex items-center gap-2 bg-black/10 w-fit px-4 py-2 rounded-2xl">
            <Trophy size={16} />
            <span className="text-[10px] font-black uppercase">Bloqueado - Nivel 5</span>
          </div>
        )}
      </div>
      
      {!locked && (
        <div className="absolute -right-8 -bottom-8 bg-white/10 w-32 h-32 rounded-full transform group-hover:scale-150 transition-transform duration-700"></div>
      )}
    </div>
  );
};

export default Dashboard;
