const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function getToken(role = 'ADMIN') {
  const res = await fetch(`${API_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(`Failed to get token: ${res.status}`);
  const { token } = await res.json();

  const { exp } = JSON.parse(atob(token.split('.')[1]));
  localStorage.setItem('studysync_jwt', token);
  localStorage.setItem('studysync_jwt_exp', String(exp));

  return token;
}

async function resolveToken() {
  const token = localStorage.getItem('studysync_jwt');
  const exp   = Number(localStorage.getItem('studysync_jwt_exp'));
  if (!token || !exp || exp * 1000 < Date.now()) {
    return getToken('ADMIN');
  }
  return token;
}

export async function apiRequest(method, path, body) {
  const token = await resolveToken();
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${path}`, options);
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// Courses
export const fetchCourses  = (limit = 10, offset = 0) => apiRequest('GET', `/api/v1/courses?limit=${limit}&offset=${offset}`);
export const createCourse  = (data)        => apiRequest('POST',   '/api/v1/courses', data);
export const updateCourse  = (id, data)    => apiRequest('PUT',    `/api/v1/courses/${id}`, data);
export const deleteCourse  = (id)          => apiRequest('DELETE', `/api/v1/courses/${id}`);

// Decks
export const fetchDecks    = (limit = 10, offset = 0) => apiRequest('GET', `/api/v1/decks?limit=${limit}&offset=${offset}`);
export const createDeck    = (data)        => apiRequest('POST',   '/api/v1/decks', data);
export const updateDeck    = (id, data)    => apiRequest('PUT',    `/api/v1/decks/${id}`, data);
export const deleteDeck    = (id)          => apiRequest('DELETE', `/api/v1/decks/${id}`);
