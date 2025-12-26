
import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const nextLevelXP = 2000;
  const progress = (user.xp / nextLevelXP) * 100;

  return (
    <header className="bg-white p-6 shadow-xl rounded-b-[3rem] flex flex-col md:flex-row justify-between items-center px-6 md:px-12 border-b-4 border-yellow-400 gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-yellow-400 rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl animate-bounce">
          🦖
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-orange-700 tracking-tight leading-tight">
            MUSEO TAIMA TAIMA
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-32 md:w-48 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-orange-500 h-full transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
              Nivel {user.level} • {user.xp} XP
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 items-center bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Medallas:</span>
        <div className="flex gap-2">
          {user.medals.map((m, i) => (
            <span key={i} className="text-2xl filter drop-shadow-md hover:scale-110 transition-transform cursor-help" title="Medalla ganada">
              {m}
            </span>
          ))}
          {user.medals.length === 0 && <span className="text-xs text-gray-300 italic">¡Gana tu primera medalla!</span>}
        </div>
      </div>
    </header>
  );
};

export default Header;
