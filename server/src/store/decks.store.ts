import { v4 as uuid } from 'uuid';

interface Card { id: string; question: string; answer: string; }
export interface Deck { id: string; name: string; courseId: string | null; cards: Card[]; }

const decks: Deck[] = [
  { id: uuid(), name: 'Physics Basics', courseId: null, cards: [
    { id: uuid(), question: 'What is Newton\'s 2nd law?', answer: 'F = ma' },
    { id: uuid(), question: 'What is the speed of light?', answer: '3 × 10⁸ m/s' },
  ]},
  { id: uuid(), name: 'Math Essentials', courseId: null, cards: [
    { id: uuid(), question: 'Derivative of x²?', answer: '2x' },
  ]},
];

export const getAll  = (): Deck[] => decks;
export const getById = (id: string): Deck | undefined => decks.find(d => d.id === id);
export const create  = (data: Omit<Deck, 'id'>): Deck => {
  const item = { id: uuid(), ...data };
  decks.push(item);
  return item;
};
export const update  = (id: string, data: Partial<Omit<Deck, 'id'>>): Deck | undefined => {
  const idx = decks.findIndex(d => d.id === id);
  if (idx === -1) return undefined;
  decks[idx] = { ...decks[idx], ...data };
  return decks[idx];
};
export const remove  = (id: string): boolean => {
  const idx = decks.findIndex(d => d.id === id);
  if (idx === -1) return false;
  decks.splice(idx, 1);
  return true;
};
