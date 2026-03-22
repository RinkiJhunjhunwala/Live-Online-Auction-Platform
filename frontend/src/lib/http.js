const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://live-online-auction-platform.onrender.com';

export async function fetchJson(endpoint, options = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      // Ignore parse errors if the body isn't JSON
    }
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }

  return response.json();
}
