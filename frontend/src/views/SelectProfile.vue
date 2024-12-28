<!-- frontend/src/views/SelectProfile.vue -->
<template>
    <v-container class="py-12">
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card>
            <v-card-title class="justify-center">Escolher Perfil</v-card-title>
            <v-card-text>
              <v-row>
                <v-col
                  v-for="profile in profiles"
                  :key="profile.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card @click="select(profile.id)" class="ma-2" outlined>
                    <v-card-title class="justify-center">{{ profile.name }}</v-card-title>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import api from '../api'
  
  export default {
    name: 'SelectProfile',
    data() {
      return {
        profiles: []
      }
    },
    created() {
      this.loadProfiles()
    },
    methods: {
      loadProfiles() {
        api.getProfiles()
          .then(res => {
            this.profiles = res.data
          })
          .catch(() => {
            this.$toast.error('Erro ao carregar perfis.')
          })
      },
      select(profileId) {
        // Armazena o profileId selecionado
        localStorage.setItem('currentProfileId', profileId)
        this.$router.push('/dashboard/health-fever')
      }
    }
  }
  </script>
  
  <style scoped>
  /* Estilos adicionais se necessário */
  </style>
  