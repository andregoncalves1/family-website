// frontend-react/src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:18080/api', // Update if backend is hosted elsewhere
});

// Interceptor to add the token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const apiService = {
  // Authentication
  login(username, password) {
    return api.post('/login', { username, password });
  },
  createUser(user) {
    return api.post('/users', user);
  },

  // Profiles
  getProfiles() {
    return api.get('/profiles');
  },
  createProfile(profile) {
    return api.post('/profiles', profile);
  },

  // Fever Medication Records
  getFeverMedication(params) {
    return api.get('/fevermedications', { params });
  },
  addFeverMedication(record) {
    return api.post('/fevermedications', record);
  },

  updateFeverMedication(id, record) {
    return api.put(`/fevermedications/${id}`, record);
  },

  deleteFeverMedication(id) {
    return api.delete(`/fevermedications/${id}`);
  },

  // Diseases
  getDiseases() {
    return api.get('/diseases');
  },
  addDisease(disease) {
    return api.post('/diseases', disease);
  },
  updateDisease(id, disease) {
    return api.put(`/diseases/${id}`, disease);
  },
  deleteDisease(id) {
    return api.delete(`/diseases/${id}`);
  },

  // Medications
  getMedications() {
    return api.get('/medications');
  },
  addMedication(medication) {
    return api.post('/medications', medication);
  },
  updateMedication(id, medication) {
    return api.put(`/medications/${id}`, medication);
  },
  deleteMedication(id) {
    return api.delete(`/medications/${id}`);
  },

  // Fever Thresholds
  getFeverThresholds() {
    return api.get('/feverthresholds');
  },
  addFeverThreshold(threshold) {
    return api.post('/feverthresholds', threshold);
  },
  updateFeverThreshold(id, threshold) {
    return api.put(`/feverthresholds/${id}`, threshold);
  },
  deleteFeverThreshold(id) {
    return api.delete(`/feverthresholds/${id}`);
  },

  // Reports
  generateReportPDF(params) {
    return api.get('/reports/pdf', { params, responseType: 'blob' });
  },
};

export default apiService;
