<!-- frontend/src/views/Management.vue -->
<template>
    <v-container class="py-12">
      <v-row>
        <!-- Criar Novo Utilizador -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Criar Novo Utilizador</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="createUser">
                <v-text-field
                  v-model="newUser.username"
                  label="Username"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="newUser.password"
                  label="Password"
                  type="password"
                  required
                ></v-text-field>
                <v-btn color="primary" type="submit">Criar</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- Criar Novo Perfil -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Criar Novo Perfil</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="createProfile">
                <v-text-field
                  v-model="newProfile.name"
                  label="Nome do Perfil"
                  required
                ></v-text-field>
                <v-btn color="primary" type="submit">Criar</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <v-row>
        <!-- Gestão de Medicações -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Gestão de Medicações</v-card-title>
            <v-card-text>
              <!-- Lista de Medicações -->
              <v-data-table
                :headers="medHeaders"
                :items="medications"
                class="elevation-1"
              >
                <template v-slot:item.actions="{ item }">
                  <v-btn small color="blue" @click="editMedication(item)">Editar</v-btn>
                  <v-btn small color="red" @click="deleteMedication(item.id)">Deletar</v-btn>
                </template>
              </v-data-table>
  
              <!-- Diálogo para Adicionar/Editar Medicação -->
              <v-dialog v-model="showMedDialog" max-width="500px">
                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ isEditingMed ? 'Editar Medicação' : 'Adicionar Medicação' }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-form @submit.prevent="isEditingMed ? updateMedicationAction() : addMedicationAction()">
                      <v-text-field
                        v-model="currentMed.name"
                        label="Nome da Medicação"
                        required
                      ></v-text-field>
                      <v-text-field
                        v-model="currentMed.color"
                        label="Cor da Medicação (Hex)"
                        required
                        :rules="[v => /^#([A-Fa-f0-9]{6})$/.test(v) || 'Cor inválida']"
                      ></v-text-field>
                      <v-btn color="primary" type="submit">{{ isEditingMed ? 'Atualizar' : 'Adicionar' }}</v-btn>
                      <v-btn color="secondary" @click="closeMedDialog">Cancelar</v-btn>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-dialog>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="openAddMedDialog">Adicionar Medicação</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
  
        <!-- Gestão de Fever Thresholds -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Gestão de Fever Thresholds</v-card-title>
            <v-card-text>
              <!-- Lista de Fever Thresholds -->
              <v-data-table
                :headers="ftHeaders"
                :items="feverThresholds"
                class="elevation-1"
              >
                <template v-slot:item.actions="{ item }">
                  <v-btn small color="blue" @click="editFeverThreshold(item)">Editar</v-btn>
                  <v-btn small color="red" @click="deleteFeverThreshold(item.id)">Deletar</v-btn>
                </template>
              </v-data-table>
  
              <!-- Diálogo para Adicionar/Editar Fever Threshold -->
              <v-dialog v-model="showFTDialog" max-width="600px">
                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ isEditingFT ? 'Editar Fever Threshold' : 'Adicionar Fever Threshold' }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-form @submit.prevent="isEditingFT ? updateFeverThresholdAction() : addFeverThresholdAction()">
                      <v-text-field
                        v-model="currentFT.label"
                        label="Label"
                        required
                      ></v-text-field>
                      <v-text-field
                        v-model="currentFT.min_temp"
                        label="Temperatura Mínima (°C)"
                        type="number"
                        step="0.1"
                        required
                      ></v-text-field>
                      <v-text-field
                        v-model="currentFT.max_temp"
                        label="Temperatura Máxima (°C)"
                        type="number"
                        step="0.1"
                        required
                      ></v-text-field>
                      <v-text-field
                        v-model="currentFT.color"
                        label="Cor da Faixa (Hex)"
                        required
                        :rules="[v => /^#([A-Fa-f0-9]{6})$/.test(v) || 'Cor inválida']"
                      ></v-text-field>
                      <v-btn color="primary" type="submit">{{ isEditingFT ? 'Atualizar' : 'Adicionar' }}</v-btn>
                      <v-btn color="secondary" @click="closeFTDialog">Cancelar</v-btn>
                    </v-form>
                  </v-card-text>
                </v-card>
              </v-dialog>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="openAddFTDialog">Adicionar Fever Threshold</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import api from '../api'
  
  export default {
    name: 'Management',
    data() {
      return {
        // Para criar usuários
        newUser: {
          username: '',
          password: ''
        },
        // Para criar perfis
        newProfile: {
          name: ''
        },
        // Para medicações
        medications: [],
        medHeaders: [
          { text: 'ID', value: 'id' },
          { text: 'Nome', value: 'name' },
          { text: 'Cor', value: 'color' },
          { text: 'Ações', value: 'actions', sortable: false }
        ],
        showMedDialog: false,
        isEditingMed: false,
        currentMed: {
          id: null,
          name: '',
          color: ''
        },
        // Para Fever Thresholds
        feverThresholds: [],
        ftHeaders: [
          { text: 'ID', value: 'id' },
          { text: 'Label', value: 'label' },
          { text: 'Temp Mínima', value: 'min_temp' },
          { text: 'Temp Máxima', value: 'max_temp' },
          { text: 'Cor', value: 'color' },
          { text: 'Ações', value: 'actions', sortable: false }
        ],
        showFTDialog: false,
        isEditingFT: false,
        currentFT: {
          id: null,
          label: '',
          min_temp: '',
          max_temp: '',
          color: ''
        }
      }
    },
    created() {
      this.loadMedications()
      this.loadFeverThresholds()
    },
    methods: {
      // Métodos para Medicações
      loadMedications() {
        api.getMedications()
          .then(res => {
            this.medications = res.data
          })
          .catch(() => {
            this.$toast.error('Erro ao carregar medicações.')
          })
      },
      openAddMedDialog() {
        this.isEditingMed = false
        this.currentMed = { id: null, name: '', color: '' }
        this.showMedDialog = true
      },
      editMedication(med) {
        this.isEditingMed = true
        this.currentMed = { ...med }
        this.showMedDialog = true
      },
      closeMedDialog() {
        this.showMedDialog = false
      },
      addMedicationAction() {
        api.addMedication(this.currentMed)
          .then(() => {
            this.$toast.success('Medicação adicionada.')
            this.loadMedications()
            this.closeMedDialog()
          })
          .catch(() => {
            this.$toast.error('Erro ao adicionar medicação.')
          })
      },
      updateMedicationAction() {
        api.updateMedication(this.currentMed.id, this.currentMed)
          .then(() => {
            this.$toast.success('Medicação atualizada.')
            this.loadMedications()
            this.closeMedDialog()
          })
          .catch(() => {
            this.$toast.error('Erro ao atualizar medicação.')
          })
      },
      deleteMedication(id) {
        if (confirm('Tem certeza que deseja deletar esta medicação?')) {
          api.deleteMedication(id)
            .then(() => {
              this.$toast.success('Medicação deletada.')
              this.loadMedications()
            })
            .catch(() => {
              this.$toast.error('Erro ao deletar medicação.')
            })
        }
      },
  
      // Métodos para Fever Thresholds
      loadFeverThresholds() {
        api.getFeverThresholds()
          .then(res => {
            this.feverThresholds = res.data
          })
          .catch(() => {
            this.$toast.error('Erro ao carregar Fever Thresholds.')
          })
      },
      openAddFTDialog() {
        this.isEditingFT = false
        this.currentFT = { id: null, label: '', min_temp: '', max_temp: '', color: '' }
        this.showFTDialog = true
      },
      editFeverThreshold(ft) {
        this.isEditingFT = true
        this.currentFT = { ...ft, min_temp: ft.min_temp.toString(), max_temp: ft.max_temp.toString() }
        this.showFTDialog = true
      },
      closeFTDialog() {
        this.showFTDialog = false
      },
      addFeverThresholdAction() {
        // Convert min_temp e max_temp para float
        const payload = {
          label: this.currentFT.label,
          min_temp: parseFloat(this.currentFT.min_temp),
          max_temp: parseFloat(this.currentFT.max_temp),
          color: this.currentFT.color
        }
        api.addFeverThreshold(payload)
          .then(() => {
            this.$toast.success('Fever Threshold adicionada.')
            this.loadFeverThresholds()
            this.closeFTDialog()
          })
          .catch(err => {
            const errorMsg = err.response?.data?.error || 'Erro ao adicionar Fever Threshold.'
            this.$toast.error(errorMsg)
          })
      },
      updateFeverThresholdAction() {
        const payload = {
          label: this.currentFT.label,
          min_temp: parseFloat(this.currentFT.min_temp),
          max_temp: parseFloat(this.currentFT.max_temp),
          color: this.currentFT.color
        }
        api.updateFeverThreshold(this.currentFT.id, payload)
          .then(() => {
            this.$toast.success('Fever Threshold atualizada.')
            this.loadFeverThresholds()
            this.closeFTDialog()
          })
          .catch(err => {
            const errorMsg = err.response?.data?.error || 'Erro ao atualizar Fever Threshold.'
            this.$toast.error(errorMsg)
          })
      },
      deleteFeverThreshold(id) {
        if (confirm('Tem certeza que deseja deletar esta Fever Threshold?')) {
          api.deleteFeverThreshold(id)
            .then(() => {
              this.$toast.success('Fever Threshold deletada.')
              this.loadFeverThresholds()
            })
            .catch(() => {
              this.$toast.error('Erro ao deletar Fever Threshold.')
            })
        }
      }
    }
  }
  </script>
  
  <style scoped>
  /* Estilos adicionais se necessário */
  </style>
  