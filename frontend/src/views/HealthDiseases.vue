<!-- frontend/src/views/HealthDiseases.vue -->
<template>
    <v-container class="py-12">
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Doenças
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="showAddDialog = true">Adicionar Doença</v-btn>
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="diseases"
                class="elevation-1"
              >
                <template v-slot:item.end_date="{ item }">
                  <span v-if="item.end_date">{{ formatDate(item.end_date) }}</span>
                  <span v-else>Em curso...</span>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Diálogo para adicionar doença -->
      <v-dialog v-model="showAddDialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Adicionar Doença</span>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="addDisease">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="newDisease.name"
                    label="Nome da Doença"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-menu
                    ref="startMenu"
                    v-model="startMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="newDisease.start_date"
                        label="Data Início"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="startDate" @input="saveStartDate"></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-menu
                    ref="endMenu"
                    v-model="endMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="newDisease.end_date"
                        label="Data Fim"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="endDate" @input="saveEndDate"></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <v-btn color="primary" type="submit">Adicionar</v-btn>
              <v-btn color="secondary" @click="closeAddDialog">Cancelar</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  import api from '../api'
  
  export default {
    name: 'HealthDiseases',
    data() {
      return {
        diseases: [],
        headers: [
          { text: 'ID', value: 'id' },
          { text: 'Nome', value: 'name' },
          { text: 'Data Início', value: 'start_date' },
          { text: 'Data Fim', value: 'end_date' },
        ],
        showAddDialog: false,
        newDisease: {
          name: '',
          start_date: '',
          end_date: ''
        },
        startMenu: false,
        endMenu: false,
        startDate: null,
        endDate: null
      }
    },
    created() {
      this.loadDiseases()
    },
    methods: {
      loadDiseases() {
        api.getDiseases()
          .then(res => {
            this.diseases = res.data
          })
          .catch(() => {
            this.$toast.error('Erro ao carregar doenças.')
          })
      },
      addDisease() {
        const payload = {
          name: this.newDisease.name,
          start_date: this.newDisease.start_date,
          end_date: this.newDisease.end_date || null
        }
        api.addDisease(payload)
          .then(() => {
            this.$toast.success('Doença adicionada.')
            this.showAddDialog = false
            this.loadDiseases()
          })
          .catch(err => {
            const errorMsg = err.response?.data?.error || 'Erro ao adicionar doença.'
            this.$toast.error(errorMsg)
          })
      },
      saveStartDate(val) {
        this.newDisease.start_date = val
        this.startMenu = false
      },
      saveEndDate(val) {
        this.newDisease.end_date = val
        this.endMenu = false
      },
      closeAddDialog() {
        this.showAddDialog = false
      },
      formatDate(dateStr) {
        const date = new Date(dateStr)
        return date.toLocaleDateString()
      }
    }
  }
  </script>
  
  <style scoped>
  /* Estilos adicionais se necessário */
  </style>
  