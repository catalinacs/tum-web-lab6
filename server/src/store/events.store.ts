import { v4 as uuid } from 'uuid';

export interface Event { id: string; title: string; type: string; date: string; courseId: string; }

const events: Event[] = [
  { id: uuid(), title: 'Midterm Exam',   type: 'Test',       date: '2026-05-20', courseId: 'course-1' },
  { id: uuid(), title: 'Lab Report Due', type: 'Deadline',   date: '2026-05-25', courseId: 'course-2' },
  { id: uuid(), title: 'Chapter 5 Quiz', type: 'Quiz',       date: '2026-06-01', courseId: 'course-1' },
];

export const getAll  = (): Event[] => events;
export const getById = (id: string): Event | undefined => events.find(e => e.id === id);
export const create  = (data: Omit<Event, 'id'>): Event => {
  const item = { id: uuid(), ...data };
  events.push(item);
  return item;
};
export const update  = (id: string, data: Partial<Omit<Event, 'id'>>): Event | undefined => {
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return undefined;
  events[idx] = { ...events[idx], ...data };
  return events[idx];
};
export const remove  = (id: string): boolean => {
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return false;
  events.splice(idx, 1);
  return true;
};
