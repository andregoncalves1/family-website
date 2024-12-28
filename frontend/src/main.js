// frontend/src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'light',
  },
})

const toastOptions = {
  // Configurações de Toast
  position: POSITION.TOP_RIGHT,
  timeout: 5000,
}

createApp(App)
  .use(router)
  .use(vuetify)
  .use(Toast, toastOptions)
  .mount('#app')
