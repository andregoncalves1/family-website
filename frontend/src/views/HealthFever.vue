<!-- frontend/src/views/HealthFever.vue -->
<template>
    <v-container class="py-12">
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Febre e Medicação
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="showAddDialog = true">Adicionar Registo</v-btn>
            </v-card-title>
            <v-card-text>
              <!-- Filtros -->
              <v-row>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="filters.startDate"
                    label="Data Início"
                    type="date"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="filters.endDate"
                    label="Data Fim"
                    type="date"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="filters.diseaseID"
                    :items="diseases"
                    item-text="name"
                    item-value="id"
                    label="Doença"
                    clearable
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-btn color="secondary" @click="loadRecords">Filtrar</v-btn>
                </v-col>
              </v-row>
  
              <!-- Gráfico -->
              <v-row>
                <v-col cols="12">
                  <FeverMedicationChart
                    :startDate="filters.startDate"
                    :endDate="filters.endDate"
                    :diseaseID="filters.diseaseID"
                  />
                </v-col>
              </v-row>
  
              <!-- Tabela de Registos -->
              <v-data-table
                :headers="headers"
                :items="records"
                class="elevation-1"
              >
                <template v-slot:item.disease_name="{ item }">
                  <span v-if="item.disease_name">{{ item.disease_name }}</span>
                  <span v-else>-</span>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Diálogo para adicionar registo -->
      <v-dialog v-model="showAddDialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Adicionar Registo</span>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="addRecord">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="newRecord.temperature"
                    label="Temperatura (°C)"
                    type="number"
                    step="0.1"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="newRecord.medication"
                    :items="medications"
                    item-text="name"
                    item-value="name"
                    label="Medicação"
                    clearable
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-menu
                    ref="menu"
                    v-model="menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="newRecord.date_time"
                        label="Data/Hora"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="date" @input="saveDate"></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="newRecord.disease_id"
                    :items="diseases"
                    item-text="name"
                    item-value="id"
                    label="Doença"
                    clearable
                  ></v-select>
                </v-col>
              </v-row>
              <v-btn color="primary" type="submit">Adicionar</v-btn>
              <v-btn color="secondary" @click="showAddDialog = false">Cancelar</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  import api from '../api'
  import FeverMedicationChart from '../components/FeverMedicationChart.vue'
  
  export default {
    name: 'HealthFever',
    components: {
      FeverMedicationChart
    },
    data() {
      return {
        filters: {
          startDate: '',
          endDate: '',
          diseaseID: ''
        },
        records: [],
        diseases: [],
        medications: [],
        headers: [
          { text: 'Data/Hora', value: 'date_time' },
          { text: 'Temperatura', value: 'temperature' },
          { text: 'Medicação', value: 'medication' },
          { text: 'Doença', value: 'disease_name' },
        ],
        showAddDialog: false,
        newRecord: {
          temperature: '',
          medication: '',
          date_time: '',
          disease_id: ''
        },
        menu: false,
        date: null
      }
    },
    created() {
      this.loadDiseases()
      this.loadMedications()
      this.loadRecords()
    },
    methods: {
      loadRecords() {
        const params = {}
        if (this.filters.startDate) params.start = this.filters.startDate
        if (this.filters.endDate) params.end = this.filters.endDate
        if (this.filters.diseaseID) params.disease_id = this.filters.diseaseID
  
        api.getFeverMedication(params)
          .then(res => {
            this.records = res.data
          })
          .catch(() => {
            this.$toast.error('Erro ao carregar registos.')
          })
      },
      loadDiseases() {
        api.getDiseases()
          .then(res => {
            this.diseases = res.data
          })
          .catch(() => {
            this.$toast.error('Erro ao carregar doenças.')
          })
      },
      loadMedications() {
        api.getMedications()
          .then(res => {
            this.medications = res.data.map(med => med.name) // Mapeia para nomes para o dropdown
          })
          .catch(() => {
            this.$toast.error('Erro ao carregar medicações.')
          })
      },
      addRecord() {
        const profileId = localStorage.getItem('currentProfileId')
        if (!profileId) {
          this.$toast.error('Selecione um perfil primeiro')
          return
        }
        const payload = {
          profile_id: parseInt(profileId),
          temperature: this.newRecord.temperature || null,
          medication: this.newRecord.medication || null,
          date_time: this.newRecord.date_time || new Date().toISOString(),
          disease_id: this.newRecord.disease_id ? parseInt(this.newRecord.disease_id) : null
        }
        api.addFeverMedication(payload)
          .then(() => {
            this.$toast.success('Registo adicionado!')
            this.showAddDialog = false
            this.loadRecords()
          })
          .catch(() => {
            this.$toast.error('Erro ao adicionar registo.')
          })
      },
      saveDate(val) {
        // Define a hora como meio-dia para simplicidade
        const selectedDate = new Date(val)
        selectedDate.setHours(12, 0, 0, 0)
        this.newRecord.date_time = selectedDate.toISOString()
        this.menu = false
      }
    }
  }
  </script>
  
  <style scoped>
  /* Estilos adicionais se necessário */
  </style>
  