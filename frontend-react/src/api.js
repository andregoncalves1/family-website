// frontend-react/src/api.js
import axios from 'axios';

// Crie uma instância do axios com a URL base da sua API
const api = axios.create({
  baseURL: 'http://192.168.31.165:18080/api', // Atualize se o backend estiver hospedado em outro lugar
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
  // ADIÇÃO: Precisamos permitir "profile_id" em GET
  getFeverMedication(params) {
    // params pode conter { profile_id, start, end, disease_id, medication, ... }
    return api.get('/fevermedications', { params });
  },
  addFeverMedication(record) {
    // record deve incluir { profile_id, temperature, medication, date_time, ... }
    return api.post('/fevermedications', record);
  },
  updateFeverMedication(id, record) {
    return api.put(`/fevermedications/${id}`, record);
  },
  deleteFeverMedication(id) {
    return api.delete(`/fevermedications/${id}`);
  },

  // **Doenças**
  // ADIÇÃO: getDiseases(profileId) -> GET /diseases?profile_id=...
  getDiseases(profileId) {
    if (profileId) {
      return api.get('/diseases', { params: { profile_id: profileId } });
    }
    // se não vier profileId, chama a rota sem query param (mantendo compatibilidade)
    return api.get('/diseases');
  },
  addDisease(disease) {
    // disease: { name, start_date, end_date, profile_id? }
    return api.post('/diseases', disease);
  },
  updateDisease(id, disease) {
    return api.put(`/diseases/${id}`, disease);
  },
  deleteDisease(id) {
    return api.delete(`/diseases/${id}`);
  },

  // **Medicações**
  // ADIÇÃO: getMedications(profileId) -> GET /medications?profile_id=...
  getMedications(profileId) {
    if (profileId) {
      return api.get('/medications', { params: { profile_id: profileId } });
    }
    // se não vier profileId, chama sem param
    return api.get('/medications');
  },
  addMedication(medication) {
    // medication: { name, color, profile_id? }
    return api.post('/medications', medication);
  },
  updateMedication(id, medication) {
    return api.put(`/medications/${id}`, medication);
  },
  deleteMedication(id) {
    return api.delete(`/medications/${id}`);
  },

  // **Limites de Febre**
  // ADIÇÃO: getFeverThresholds(profileId) -> GET /feverthresholds?profile_id=...
  getFeverThresholds(profileId) {
    if (profileId) {
      return api.get('/feverthresholds', { params: { profile_id: profileId } });
    }
    return api.get('/feverthresholds');
  },
  addFeverThreshold(threshold) {
    // threshold: { label, min_temp, max_temp, color, profile_id? }
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
