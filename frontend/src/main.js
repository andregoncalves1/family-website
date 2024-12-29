// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import 'vuetify/styles' // Ensure this is imported before creating Vuetify instance
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css' // Ensure icons are imported
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
  },
})

const toastOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 5000,
}

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(Toast, toastOptions)
app.mount('#app')
