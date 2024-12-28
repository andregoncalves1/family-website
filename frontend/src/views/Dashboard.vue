<!-- frontend/src/views/Dashboard.vue -->
<template>
    <v-app>
      <NavBar />
      <v-main>
        <router-view />
      </v-main>
    </v-app>
  </template>
  
  <script>
  import NavBar from '../components/NavBar.vue'
  
  export default {
    name: 'Dashboard',
    components: {
      NavBar
    }
  }
  </script>
  
  <style scoped>
  /* Estilos adicionais se necessário */
  </style>
  