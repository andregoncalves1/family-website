<!-- frontend/src/components/NavBar.vue -->
<template>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Meu Site Saúde</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text @click="goTo('select-profile')">Mudar Perfil</v-btn>
      <v-btn text @click="goTo('health-fever')">Febre e Medicação</v-btn>
      <v-btn text @click="goTo('health-diseases')">Doenças</v-btn>
      <v-btn text @click="goTo('health-reports')">Relatórios</v-btn>
      <v-btn text @click="goTo('management')">Gestão</v-btn>
      <v-btn text @click="logout">Sair</v-btn>
    </v-app-bar>
  </template>
  
  <script>
  export default {
    name: 'NavBar',
    methods: {
      goTo(routeName) {
        this.$router.push(`/dashboard/${routeName}`)
      },
      logout() {
        localStorage.removeItem('token')
        this.$router.push('/login')
      }
    }
  }
  </script>
  
  <style scoped>
  /* Estilos adicionais se necessário */
  </style>
  