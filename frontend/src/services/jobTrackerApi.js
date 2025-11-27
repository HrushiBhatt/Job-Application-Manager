const API_BASE_URL = 'http://localhost:4000/api';

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export async function getApplications() {
  const res = await fetch(`${API_BASE_URL}/applications`);
  return handleResponse(res);
}

export async function createApplication(app) {
  const res = await fetch(`${API_BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(app)
  });
  return handleResponse(res);
}

export async function updateApplication(id, updates) {
  const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return handleResponse(res);
}

export async function deleteApplication(id) {
  const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}
