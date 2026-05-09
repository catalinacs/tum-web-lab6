import { v4 as uuid } from 'uuid';

export interface Course { id: string; name: string; color: string; }

const courses: Course[] = [
  { id: uuid(), name: 'Physics',           color: '#f4a7b9' },
  { id: uuid(), name: 'Embedded Systems',  color: '#f4c430' },
  { id: uuid(), name: 'Programming Web',   color: '#c3a8ea' },
];

export const getAll  = (): Course[] => courses;
export const getById = (id: string): Course | undefined => courses.find(c => c.id === id);
export const create  = (data: Omit<Course, 'id'>): Course => {
  const item = { id: uuid(), ...data };
  courses.push(item);
  return item;
};
export const update  = (id: string, data: Partial<Omit<Course, 'id'>>): Course | undefined => {
  const idx = courses.findIndex(c => c.id === id);
  if (idx === -1) return undefined;
  courses[idx] = { ...courses[idx], ...data };
  return courses[idx];
};
export const remove  = (id: string): boolean => {
  const idx = courses.findIndex(c => c.id === id);
  if (idx === -1) return false;
  courses.splice(idx, 1);
  return true;
};
