// Use VITE_API_URL from .env or default to /api proxy
const API_URL = import.meta.env.VITE_API_URL || '/api';
console.log('Final API_URL used:', API_URL);

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('codebite.auth.token');
  console.log('localStorage keys:', Object.keys(localStorage));
  console.log('Token value:', token);
  const url = `${API_URL}${endpoint}`;
  console.log('API Request:', { endpoint, method: options.method || 'GET', token: !!token, url });

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    method: 'GET',
    headers,
    ...options
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${response.status}`);
  }

  return response.json();
};

// Auth
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  checkUser: (email) => apiRequest('/auth/check-user', { method: 'POST', body: JSON.stringify({ email }) }),
  sendOTP: (email, type = 'register') => apiRequest('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email, type }) }),
  verifyOTP: (email, otp) => apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  setPassword: (email, password) => apiRequest('/auth/set-password', { method: 'POST', body: JSON.stringify({ email, password }) })
};

// Foods
export const foodsAPI = {
  get: () => apiRequest('/foods'),
  create: (food) => apiRequest('/foods', { method: 'POST', body: JSON.stringify(food) }),
  update: (id, food) => apiRequest(`/foods/${id}`, { method: 'PUT', body: JSON.stringify(food) }),
  delete: (id) => apiRequest(`/foods/${id}`, { method: 'DELETE' })
};

// Orders
export const ordersAPI = {
  get: () => apiRequest('/orders'),
  getById: (id) => apiRequest(`/orders/${id}`),
  create: (order) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(order) }),
  updateStatus: (id, status) => apiRequest(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  delete: (id) => apiRequest(`/orders/${id}`, { method: 'DELETE' })
};

// Polls
export const pollsAPI = {
  get: () => apiRequest('/polls'),
  create: (poll) => apiRequest('/polls', { method: 'POST', body: JSON.stringify(poll) }),
  update: (id, poll) => apiRequest(`/polls/${id}`, { method: 'PUT', body: JSON.stringify(poll) }),
  delete: (id) => apiRequest(`/polls/${id}`, { method: 'DELETE' }),
  vote: (pollId) => apiRequest(`/polls/${pollId}/vote`, { method: 'POST' })
};

export const usersAPI = {
  getMe: () => apiRequest('/users/me'),
  getAll: () => apiRequest('/users'),
  updateRole: (id, role) => apiRequest(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  getWishlist: () => apiRequest('/users/wishlist'),
  toggleWishlist: (foodId) => apiRequest(`/users/wishlist/${foodId}`, { method: 'POST' }),
  updateMe: (data) => apiRequest('/users/me', { method: 'PUT', body: JSON.stringify(data) })
};

// Payments
export const paymentsAPI = {
  create: (paymentData) => apiRequest('/payments', { method: 'POST', body: JSON.stringify(paymentData) }),
  createLegacy: (paymentData) => apiRequest('/payments/create', { method: 'POST', body: JSON.stringify(paymentData) }),
  verify: (paymentData) => apiRequest('/payments/verify', { method: 'POST', body: JSON.stringify(paymentData) }),
  getHistory: () => apiRequest('/payments/history'),
  getDetails: (paymentId) => apiRequest(`/payments/${paymentId}`),
  refund: (paymentId, reason) => apiRequest(`/payments/${paymentId}/refund`, { method: 'POST', body: JSON.stringify({ reason }) })
};

export const restaurantsAPI = {
  get: () => apiRequest('/restaurants'),
  update: (id, data) => apiRequest(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

// Chatbot
export const chatAPI = {
  sendMessage: (history) => apiRequest('/chat', { method: 'POST', body: JSON.stringify({ history }) })
};


// Riders/Raiders
export const ridersAPI = {
  getAvailable: () => apiRequest('/riders/available'),
  getAssigned: () => apiRequest('/riders/assigned'),
  claim: (id) => apiRequest(`/riders/${id}/claim`, { method: 'POST' }),
  updateStatus: (id, status) => apiRequest(`/riders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  listRiders: () => apiRequest('/riders/list'),
  assignRider: (orderId, riderId) => apiRequest(`/riders/${orderId}/assign`, { method: 'POST', body: JSON.stringify({ riderId }) }),
  reject: (id) => apiRequest(`/riders/${id}/reject`, { method: 'POST' })
};

// Upload
export const uploadAPI = {
  post: (formData) => {
    const token = localStorage.getItem('codebite.auth.token');
    return fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(res => res.json());
  }
};
