export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || '';
};

export const apiFetch = (path: string, options?: RequestInit) => {
  const baseUrl = getApiUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return fetch(`${baseUrl}${normalizedPath}`, options);
};
