/**
 * API client for the AURA API backend.
 * All endpoints are relative — Vite's dev proxy forwards /api/* to FastAPI.
 */

const BASE = '/api/v1';

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `API error ${res.status}`);
  }

  return res.json();
}

/** Detailed health check */
export function fetchHealth() {
  return request('/health');
}

/** Run a readmission risk prediction */
export function predict(patientData) {
  return request('/predict', {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
}

/** List predictions (newest first) */
export function fetchPredictions({ limit = 20, offset = 0, riskLevel } = {}) {
  const params = new URLSearchParams({ limit, offset });
  if (riskLevel) params.set('risk_level', riskLevel);
  return request(`/predictions?${params}`);
}

/** Get a single prediction by ID */
export function fetchPrediction(id) {
  return request(`/predictions/${id}`);
}

/** Dashboard aggregate statistics */
export function fetchDashboardStats() {
  return request('/stats/dashboard');
}
