// frontend/src/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:18080/api', // Altere para o endereço do backend se necessário
})

// Interceptor para adicionar o token a todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

export default {
  login(username, password) {
    return api.post('/login', { username, password })
  },
  createUser(user) {
    return api.post('/users', user)
  },
  getProfiles() {
    return api.get('/profiles')
  },
  createProfile(profile) {
    return api.post('/profiles', profile)
  },
  getFeverMedication(params) {
    return api.get('/fevermed', { params })
  },
  addFeverMedication(record) {
    return api.post('/fevermed', record)
  },
  getDiseases() {
    return api.get('/diseases')
  },
  addDisease(disease) {
    return api.post('/diseases', disease)
  },
  updateDisease(id, disease) {
    return api.put(`/diseases/${id}`, disease)
  },
  generateReportPDF(params) {
    return api.get('/reports/pdf', { params, responseType: 'blob' })
  },
  // Novos métodos para Medicações
  getMedications() {
    return api.get('/medications')
  },
  addMedication(medication) {
    return api.post('/medications', medication)
  },
  updateMedication(id, medication) {
    return api.put(`/medications/${id}`, medication)
  },
  deleteMedication(id) {
    return api.delete(`/medications/${id}`)
  },
  // Novos métodos para Fever Thresholds
  getFeverThresholds() {
    return api.get('/feverthresholds')
  },
  addFeverThreshold(threshold) {
    return api.post('/feverthresholds', threshold)
  },
  updateFeverThreshold(id, threshold) {
    return api.put(`/feverthresholds/${id}`, threshold)
  },
  deleteFeverThreshold(id) {
    return api.delete(`/feverthresholds/${id}`)
  },
}
