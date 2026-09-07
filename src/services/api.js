// Smart API base resolver supporting Web, Capacitor Android (Emulator & Physical Device), and Custom Server URL
const getApiBase = () => {
  // 1. Check custom override from localStorage if user configured server IP
  const customUrl = localStorage.getItem('reconnect_custom_api');
  if (customUrl) return customUrl.replace(/\/+$/, '');

  // 2. Check Vite build env
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // 3. Detect Capacitor Native Android Platform
  const isCapacitor = window?.Capacitor?.isNativePlatform?.() || 
                      window.location.protocol === 'capacitor:' || 
                      (window.location.hostname === 'localhost' && !window.location.port);
  
  if (isCapacitor) {
    // Android Emulator default loopback alias to host machine port 5001
    return 'http://10.0.2.2:5001/api';
  }

  // 4. Default for Web development / production
  return '/api';
};

export const API_BASE = getApiBase();

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (includeAuth) {
    const token = localStorage.getItem('reconnect_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

async function handleResponse(response) {
  const data = await response.json().catch(() => ({ success: false, message: 'Invalid server response' }));
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('reconnect_token');
    }
    throw new Error(data.message || 'An error occurred during request');
  }
  return data;
}

export const api = {
  // Auth API
  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async googleAuth(googleData) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(googleData)
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  // Items API
  async getItems(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/items?${query.toString()}`);
    return handleResponse(res);
  },

  async getItemById(id) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  async createItem(itemData) {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(itemData)
    });
    return handleResponse(res);
  },

  async updateItem(id, itemData) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(itemData)
    });
    return handleResponse(res);
  },

  async updateItemStatus(id, status) {
    const res = await fetch(`${API_BASE}/items/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async deleteItem(id) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  async getLiveMatches(params = {}) {
    const query = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/items/live-matches?${query.toString()}`);
    return handleResponse(res);
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/items/stats`);
    return handleResponse(res);
  },

  // Claims API
  async createClaim(claimData) {
    const res = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(claimData)
    });
    return handleResponse(res);
  },

  async getMyClaims() {
    const res = await fetch(`${API_BASE}/claims/my-claims`, {
      headers: getHeaders(true)
    });
    return handleResponse(res);
  },

  async updateClaimStatus(claimId, status) {
    const res = await fetch(`${API_BASE}/claims/${claimId}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  }
};
