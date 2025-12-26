
export interface UserProfile {
  name: string;
  xp: number;
  level: number;
  medals: string[];
}

export interface Species {
  id: string;
  nombre: string;
  cientifico: string;
  silueta: string;
  colorBase: string;
  descripcion: string;
}

export type ViewState = 'dashboard' | 'art' | 'puzzle' | 'stories';
