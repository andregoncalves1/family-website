<template>
    <div class="health-reports">
      <h2>Relatórios</h2>
      <p>Clique no botão para gerar relatório (simulado).</p>
      <button @click="generate">Gerar Relatório</button>
      <p>{{ message }}</p>
    </div>
  </template>
  
  <script>
  import api from '../api'
  
  export default {
    name: 'HealthReports',
    data() {
      return {
        message: ''
      }
    },
    methods: {
      generate() {
        api.generateReport()
          .then(res => {
            this.message = res.data.message
          })
          .catch(() => {
            this.message = 'Erro ao gerar relatório.'
          })
      }
    }
  }
  </script>
  