import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3002/api", // Your backend port
});

// Add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("codebite.auth.token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Handle response errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("codebite.auth.token");
      localStorage.removeItem("codebite.auth.user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => API.post("/auth/login", credentials).then(res => res.data),
  register: (userData) => API.post("/auth/register", userData).then(res => res.data)
};

// Foods APIs
export const foodsAPI = {
  get: () => API.get("/foods").then(res => res.data),
  create: (food) => API.post("/foods", food).then(res => res.data),
  update: (id, food) => API.put(`/foods/${id}`, food).then(res => res.data),
  delete: (id) => API.delete(`/foods/${id}`).then(res => res.data)
};

// Orders APIs
export const ordersAPI = {
  get: () => API.get("/orders").then(res => res.data),
  create: (order) => API.post("/orders", order).then(res => res.data),
  updateStatus: (id, status) => API.put(`/orders/${id}/status`, { status }).then(res => res.data),
  delete: (id) => API.delete(`/orders/${id}`).then(res => res.data)
};

// Polls APIs
export const pollsAPI = {
  get: () => API.get("/polls").then(res => res.data),
  vote: (pollId, foodId) => API.post(`/polls/${pollId}/vote`, { foodId }).then(res => res.data)
};

// Users APIs
export const usersAPI = {
  getWishlist: () => API.get("/users/wishlist").then(res => res.data),
  toggleWishlist: (foodId) => API.post(`/users/wishlist/${foodId}`).then(res => res.data),
  updateMe: (data) => API.put("/users/me", data).then(res => res.data)
};

// Payments APIs
export const paymentsAPI = {
  create: (paymentData) => API.post("/payments", paymentData).then(res => res.data),
  verify: (paymentId) => API.get(`/payments/${paymentId}/verify`).then(res => res.data)
};

export default API;
