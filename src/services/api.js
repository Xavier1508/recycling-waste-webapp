import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor untuk menambahkan token otentikasi
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor untuk menangani error otentikasi global
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error("Unauthorized or Forbidden:", error.response);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.dispatchEvent(new CustomEvent("authChange"));
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

// --- AUTH API ---
export const authAPI = {
    // Customer Auth
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (userData) => api.post('/auth/register', userData),
    
    // Driver Auth
    loginDriver: (driver_code, password) => api.post('/auth/driver/login', { driver_code, password }),
    registerDriver: (driverData) => {
        return api.post('/auth/driver/register', driverData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // General
    logout: () => api.post('/auth/logout'), 
};

// --- USER API ---
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (userData) => api.put('/users/profile', userData),
    getPoints: () => api.get('/users/me/points/summary'),
    getRecentPointsHistory: () => api.get('/users/me/points/history'),
    uploadAvatar: (formData) => api.post('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    changePassword: (passwordData) => api.put('/users/profile/password', passwordData),
    getActivePickup: () => api.get('/users/active-pickup'),
};

// --- DRIVER API (NEW) ---
export const driverAPI = {
    getProfile: () => api.get('/drivers/profile'),
    updateProfile: (driverData) => api.put('/drivers/profile', driverData),
    getHistory: () => api.get('/drivers/history'),
    getStats: () => api.get('/drivers/stats'),
    updateStatus: (statusData) => api.put('/drivers/status', statusData),
    getActiveTask: () => api.get('/drivers/active-task'),
};

// --- ADDRESS API ---
export const addressAPI = {
    getAll: () => api.get('/addresses'),
    add: (addressData) => api.post('/addresses', addressData),
    update: (addressId, addressData) => api.put(`/addresses/${addressId}`, addressData),
    delete: (addressId) => api.delete(`/addresses/${addressId}`),
    setDefault: (addressId) => api.put(`/addresses/${addressId}/set-default`),
};

// --- PICKUP API ---
export const pickupAPI = {
    createRequest: (pickupData) => {
        if (pickupData instanceof FormData) {
            return api.post('/pickups', pickupData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return api.post('/pickups', pickupData);
    },
    getHistory: () => api.get('/pickups/history'),
    getCategories: () => api.get('/pickups/categories'),
    completeTask: (pickupId) => api.post(`/pickups/${pickupId}/complete`),
    cancelPickup: (pickupId) => api.put(`/pickups/${pickupId}/cancel`),
    getDetails: (pickupId) => api.get(`/pickups/${pickupId}`),
    submitFeedback: (pickupId, feedbackData) => api.post(`/feedback/${pickupId}`, feedbackData),
    updatePickupItems: (pickupId, itemsData) => api.put(`/pickups/${pickupId}/items`, itemsData),
};

// --- CATALOG & REDEEM API ---
export const catalogAPI = {
    getCatalogItems: () => api.get('/catalog-items'),
};

export const redeemAPI = {
    redeemPoints: (redemptionData) => api.post('/points/redeem', redemptionData),
};

export const offerAPI = {
    accept: (offerId) => api.post(`/offers/${offerId}/accept`),
    decline: (offerId) => api.post(`/offers/${offerId}/decline`),
};

// --- PENAMBAHAN: API BARU UNTUK LOCATIONIQ AUTOCOMPLETE ---
export const locationAPI = {
    getAutocomplete: (query) => {
        const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN;
        const url = `https://api.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(query)}&limit=5&countrycodes=id&normalizeaddress=1`;
        return axios.get(url);
    }
};


export default api;