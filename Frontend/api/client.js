const BASE = 'http://54.79.113.204:8080';

const handleResponse = (response) => {
  return response;
};

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (window.currentUserEmail) {
    headers['X-User-Email'] = window.currentUserEmail;
  }
  return headers;
};

export const api = {
  get: (path) =>
    fetch(`${BASE}${path}`, {
      method: 'GET',
      headers: getHeaders(),
    }).then(handleResponse),

  post: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse),

  put: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse),

  delete: (path) =>
    fetch(`${BASE}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};