
import { Species } from './types';

export const ESPECIES: Species[] = [
  { 
    id: 'gliptodonte', 
    nombre: 'Gliptodonte', 
    cientifico: 'Glyptotherium sp.', 
    silueta: 'https://images.unsplash.com/photo-1551103756-c4ea6eaf391f?auto=format&fit=crop&q=80&w=800', 
    colorBase: '#27AE60',
    descripcion: 'Un armadillo gigante con un caparazón óseo impenetrable.'
  },
  { 
    id: 'mastodonte', 
    nombre: 'Mastodonte', 
    cientifico: 'Notiomastodon platensis', 
    silueta: 'https://images.unsplash.com/photo-1581022295087-35e593704911?auto=format&fit=crop&q=80&w=800', 
    colorBase: '#2980B9',
    descripcion: 'Un pariente lejano de los elefantes que frecuentaba los manantiales de Taima Taima.'
  },
  { 
    id: 'sable', 
    nombre: 'Dientes de Sable', 
    cientifico: 'Smilodon populator', 
    silueta: 'https://images.unsplash.com/photo-1564349683136-77e08bef1ef1?auto=format&fit=crop&q=80&w=800', 
    colorBase: '#9C4221',
    descripcion: 'Un depredador feroz con caninos largos como cuchillos que vivió en las sabanas de Falcón.'
  }
];

export const COLORS = ['#9C4221', '#F4D03F', '#2980B9', '#27AE60', '#8E44AD', '#E67E22', '#000000', '#FFFFFF'];
export const BRUSH_SIZES = [8, 12, 20, 32];
