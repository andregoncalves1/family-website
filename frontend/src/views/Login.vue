<!-- frontend/src/views/Login.vue -->
<template>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card>
            <v-card-title class="justify-center">
              <span class="text-h5">Login</span>
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="doLogin">
                <v-text-field
                  v-model="username"
                  label="Username"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  label="Password"
                  type="password"
                  required
                ></v-text-field>
                <v-btn color="primary" type="submit" class="mt-4" block>
                  Login
                </v-btn>
              </v-form>
              <v-alert v-if="error" type="error" class="mt-4">
                {{ error }}
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import api from '../api'
  
  export default {
    name: 'Login',
    data() {
      return {
        username: '',
        password: '',
        error: ''
      }
    },
    methods: {
      doLogin() {
        this.error = ''
        api.login(this.username, this.password)
          .then(res => {
            localStorage.setItem('token', res.data.token)
            this.$router.push('/dashboard/select-profile')
          })
          .catch(err => {
            this.error = err.response?.data?.error || 'Erro de login'
          })
      }
    }
  }
  </script>
  
  <style scoped>
  .fill-height {
    height: 100vh;
  }
  </style>
  