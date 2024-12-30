// frontend-react/src/api.js
import axios from 'axios';

// Crie uma instância do axios com a URL base da sua API
const api = axios.create({
  baseURL: 'http://localhost:18080/api', // Atualize se o backend estiver hospedado em outro lugar
});

// Interceptor para adicionar o token a cada requisição, se disponível
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

// Objeto de serviços da API
const apiService = {
  // **Autenticação**
  login(username, password) {
    return api.post('/login', { username, password });
  },
  createUser(user) {
    return api.post('/users', user);
  },

  // **Perfis**
  getProfiles() {
    return api.get('/profiles');
  },
  getProfile(id) {
    return api.get(`/profiles/${id}`); // Endpoint para buscar um perfil específico
  },
  createProfile(profile) {
    return api.post('/profiles', profile);
  },
  updateProfile(id, profile) {
    return api.put(`/profiles/${id}`, profile);
  },
  deleteProfile(id) {
    return api.delete(`/profiles/${id}`);
  },

  // **Registros de Febre e Medicação**
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

  // **Doenças**
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

  // **Medicações**
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

  // **Limites de Febre**
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

  // **Relatórios**
  generateReportPDF(params) {
    return api.get('/reports/pdf', { params, responseType: 'blob' });
  },
};

export default apiService;
