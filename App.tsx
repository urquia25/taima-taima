
import React, { useState } from 'react';
import { UserProfile, ViewState } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PaleoArtModule from './components/PaleoArtModule';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<UserProfile>({ 
    name: 'Explorador', 
    xp: 650, 
    level: 2, 
    medals: ['🦴', '🔍'] 
  });

  const handleFinishArt = (gainedXP: number) => {
    setUser(prev => {
      const newXP = prev.xp + gainedXP;
      // Simple level up logic
      const newLevel = Math.floor(newXP / 1000) + 1;
      const newMedals = [...prev.medals];
      if (newLevel > prev.level) {
        newMedals.push('🎨');
      }
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        medals: Array.from(new Set(newMedals))
      };
    });
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FDFEFE] selection:bg-orange-100 selection:text-orange-900">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view === 'dashboard' && (
          <Dashboard setView={setView} />
        )}

        {view === 'art' && (
          <PaleoArtModule 
            onBack={() => setView('dashboard')} 
            onFinish={handleFinishArt}
          />
        )}

        {/* Placeholder for other views */}
        {(view === 'puzzle' || view === 'stories') && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
             <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-5xl mb-6 grayscale">
               🚧
             </div>
             <h2 className="text-3xl font-black text-slate-800">Próximamente...</h2>
             <p className="text-slate-500 font-bold mt-2">Estamos excavando esta zona para ti.</p>
             <button 
               onClick={() => setView('dashboard')}
               className="mt-8 bg-orange-500 text-white font-black px-8 py-3 rounded-2xl shadow-lg"
             >
               VOLVER AL INICIO
             </button>
          </div>
        )}
      </main>

      <footer className="py-12 text-center">
        <div className="flex justify-center items-center gap-2 opacity-30 grayscale hover:opacity-100 transition-opacity duration-500 cursor-default">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Taima Taima • Venezuela • Pleistoceno</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
