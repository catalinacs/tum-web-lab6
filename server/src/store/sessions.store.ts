import { v4 as uuid } from 'uuid';

export interface Session { id: string; courseId: string; duration: number; completedAt: string; }

const sessions: Session[] = [
  { id: uuid(), courseId: 'course-1', duration: 25, completedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: uuid(), courseId: 'course-2', duration: 50, completedAt: new Date(Date.now() - 43200000).toISOString() },
  { id: uuid(), courseId: 'course-1', duration: 25, completedAt: new Date().toISOString() },
];

export const getAll  = (): Session[] => sessions;
export const getById = (id: string): Session | undefined => sessions.find(s => s.id === id);
export const create  = (data: Omit<Session, 'id'>): Session => {
  const item = { id: uuid(), ...data };
  sessions.push(item);
  return item;
};
export const update  = (id: string, data: Partial<Omit<Session, 'id'>>): Session | undefined => {
  const idx = sessions.findIndex(s => s.id === id);
  if (idx === -1) return undefined;
  sessions[idx] = { ...sessions[idx], ...data };
  return sessions[idx];
};
export const remove  = (id: string): boolean => {
  const idx = sessions.findIndex(s => s.id === id);
  if (idx === -1) return false;
  sessions.splice(idx, 1);
  return true;
};
