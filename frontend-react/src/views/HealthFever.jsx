// src/views/HealthFever.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
  Typography,
  Slider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import api from '../api';
import FeverMedicationChart from '../components/FeverMedicationChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Funções auxiliares para obter datas
const getCurrentDateTimeLocal = () => {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const pad = (num) => String(num).padStart(2, '0');
  const year = yesterday.getFullYear();
  const month = pad(yesterday.getMonth() + 1);
  const day = pad(yesterday.getDate());
  return `${year}-${month}-${day}`;
};

const getThirtyDaysAgoDate = () => {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 30);
  const pad = (num) => String(num).padStart(2, '0');
  const year = pastDate.getFullYear();
  const month = pad(pastDate.getMonth() + 1);
  const day = pad(pastDate.getDate());
  return `${year}-${month}-${day}`;
};

const formatDateTimeLocal = (dateTimeStr) => {
  if (!dateTimeStr) {
    return getCurrentDateTimeLocal(); // Fallback para data/hora atual
  }
  const date = new Date(dateTimeStr);
  const pad = (num) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function HealthFever() {
  // Estado para os filtros
  const [filters, setFilters] = useState({
    startDate: getYesterdayDate(),
    endDate: getCurrentDateTimeLocal().slice(0, 10), // Apenas a data
    diseaseID: '',
  });

  // Estados para registros, doenças e medicações
  const [records, setRecords] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para o Slider
  const [dateRange, setDateRange] = useState([
    new Date(getYesterdayDate()).getTime(),
    new Date(getCurrentDateTimeLocal()).getTime(),
  ]);

  // Estados para Diálogos de Edição e Exclusão
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Estado para o Diálogo de Adição
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    temperature: '',
    medication: '',
    date_time: getCurrentDateTimeLocal(), // Data/Hora atual
  });
  const [saving, setSaving] = useState(false);

  // Função auxiliar para gerar IDs temporários únicos
  const generateTempId = () => {
    return `temp-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Função para sanitizar e garantir que cada registro tenha um 'id'
  const sanitizeRecords = (fetchedRecords) => {
    if (!Array.isArray(fetchedRecords)) return [];

    return fetchedRecords
      .filter(record => record !== undefined && record !== null && typeof record === 'object') // Remove registros indefinidos, nulos ou não objetos
      .map(record => ({
        ...record,
        id: record.id !== undefined && record.id !== null ? record.id : generateTempId(),
        // Preencher campos opcionais com valores padrão
        date_time: record.date_time ? record.date_time : '',
        medication: record.medication ? record.medication : '',
        disease_name: record.disease_name ? record.disease_name : '',
        temperature: record.temperature !== undefined ? record.temperature : null,
        profile_id: record.profile_id !== undefined ? record.profile_id : null,
      }));
  };

  // Função para buscar registros
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) params.start = filters.startDate;
      if (filters.endDate) params.end = filters.endDate;
      if (filters.diseaseID) params.diseaseID = filters.diseaseID;
      // diseaseID é usado apenas para filtrar, não para mapear diretamente nos registros

      const response = await api.getFeverMedication(params);

      // Sanitizar os registros recebidos
      const sanitizedRecords = sanitizeRecords(response.data);
      console.log("Registros Sanitizados:", sanitizedRecords); // Log para depuração

      // Filtrar registros indefinidos ou nulos
      const filteredRecords = sanitizedRecords.filter(record => record !== null && record !== undefined);
      setRecords(filteredRecords);
    } catch (error) {
      toast.error('Erro ao carregar registros.');
      console.error('Erro ao carregar registros:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar doenças
  const fetchDiseases = async () => {
    try {
      const response = await api.getDiseases();
      setDiseases(response.data);
    } catch (error) {
      toast.error('Erro ao carregar doenças.');
      console.error('Erro ao carregar doenças:', error);
    }
  };

  // Função para buscar medicações
  const fetchMedications = async () => {
    try {
      const response = await api.getMedications();
      setMedications(response.data);
    } catch (error) {
      toast.error('Erro ao carregar medicações.');
      console.error('Erro ao carregar medicações:', error);
    }
  };

  // Handler para mudança nos filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'diseaseID') {
      if (value === '') {
        // Resetar para intervalo de datas padrão se nenhuma doença for selecionada
        setFilters({
          ...filters,
          diseaseID: '',
          startDate: getYesterdayDate(),
          endDate: getCurrentDateTimeLocal().slice(0, 10),
        });
      } else {
        // Encontrar as datas de início e fim da doença selecionada
        const selectedDisease = diseases.find(d => d.id === value);
        if (selectedDisease) {
          const startDate = FormatDate(selectedDisease.start_date);
          const endDate = selectedDisease.end_date ? FormatDate(selectedDisease.end_date) : getCurrentDateTimeLocal().slice(0, 10);
          setFilters({
            ...filters,
            diseaseID: value,
            startDate: startDate,
            endDate: endDate,
          });
        }
      }
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  // Função para aplicar os filtros
  const handleFilter = () => {
    fetchRecords();
  };

  // Função para formatar date_time no formato "YYYY-MM-DDTHH:MM"
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) {
      return getCurrentDateTimeLocal(); // Fallback para data/hora atual
    }
    return dateTimeStr.slice(0, 16); // "YYYY-MM-DDTHH:MM"
  };

  // Handler para abrir o diálogo de adicionar registro e definir a data/hora atual
  const openAddDialog = () => {
    setNewRecord({
      temperature: '',
      medication: '',
      date_time: getCurrentDateTimeLocal(), // Define a data/hora atual
    });
    setAddDialogOpen(true);
  };

  // Handler para adicionar um novo registro
  const handleAddRecord = async () => {
    const profileId = localStorage.getItem('currentProfileId');
    if (!profileId) {
      toast.error('Selecione um perfil primeiro.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        profile_id: parseInt(profileId),
        temperature: newRecord.temperature
          ? parseFloat(newRecord.temperature)
          : null,
        medication: newRecord.medication || null,
        date_time: formatDateTime(newRecord.date_time),
      };

      await api.addFeverMedication(payload);
      toast.success('Registro adicionado com sucesso!');
      fetchRecords();
      setAddDialogOpen(false);
      setNewRecord({
        temperature: '',
        medication: '',
        date_time: getCurrentDateTimeLocal(), // Resetar para data/hora atual
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Erro ao adicionar registro.';
      toast.error(errorMsg);
      console.error('Erro ao adicionar registro:', error);
    } finally {
      setSaving(false);
    }
  };

  // Função para formatar os timestamps para "YYYY-MM-DD"
  const formatTimestampToDate = (timestamp) => {
    const date = new Date(timestamp);
    const pad = (num) => String(num).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    return `${year}-${month}-${day}`;
  };

  // Manipulador do Slider
  const handleSliderChange = (event, newValue) => {
    setDateRange(newValue);
    const newStartDate = formatTimestampToDate(newValue[0]);
    const newEndDate = formatTimestampToDate(newValue[1]);
    setFilters({
      ...filters,
      startDate: newStartDate,
      endDate: newEndDate,
      diseaseID: '', // Resetar filtro de doença quando o slider muda
    });
  };

  // Função para formatar uma data para "YYYY-MM-DD"
  const formatDate = (date) => {
    const d = new Date(date);
    const pad = (num) => String(num).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${year}-${month}-${day}`;
  };

  // Handlers para Edição
  const handleEdit = (record) => {
    setRecordToEdit({
      ...record,
      date_time: formatDateTime(record.date_time),
    });
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setRecordToEdit(null);
  };

  const saveEdit = async () => {
    try {
      const payload = {
        temperature: recordToEdit.temperature !== '' ? parseFloat(recordToEdit.temperature) : null,
        medication: recordToEdit.medication || null,
        date_time: formatDateTime(recordToEdit.date_time), // Garantir o formato correto
      };
      await api.updateFeverMedication(recordToEdit.id, payload);
      toast.success('Registro atualizado com sucesso!');
      fetchRecords(); // Recarregar os registros
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Erro ao atualizar registro.';
      toast.error(errorMsg);
      console.error('Erro ao atualizar registro:', error);
    } finally {
      handleEditDialogClose();
    }
  };

  // Handlers para Exclusão
  const handleDelete = (record) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      await api.deleteFeverMedication(recordToDelete.id);
      toast.success('Registro apagado com sucesso!');
      fetchRecords(); // Recarregar os registros
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Erro ao apagar registro.';
      toast.error(errorMsg);
      console.error('Erro ao apagar registro:', error);
    } finally {
      handleDeleteDialogClose();
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchDiseases();
    fetchMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Atualizar o dateRange quando os filtros são atualizados programaticamente
    const newStartTimestamp = new Date(filters.startDate).getTime();
    const newEndTimestamp = new Date(filters.endDate).getTime();
    setDateRange([newStartTimestamp, newEndTimestamp]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate]);

  const columns = [
    {
      field: 'date_time',
      headerName: 'Data/Hora',
      flex: 1,
      renderCell: (params) => {
        if (params?.row?.date_time) {
          const date = new Date(params.row.date_time);
          if (!isNaN(date)) {
            return date.toLocaleString();
          }
        }
        return 'N/A';
      },
    },
    {
      field: 'temperature',
      headerName: 'Temperatura (°C)',
      flex: 1,
    },
    {
      field: 'medication',
      headerName: 'Medicação',
      flex: 1,
      renderCell: (params) => {
        return params?.row?.medication ? params.row.medication : 'N/A';
      },
    },
    {
      field: 'disease_name',
      headerName: 'Doença',
      flex: 1,
      renderCell: (params) => {
        return params?.row?.disease_name ? params.row.disease_name : 'N/A';
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Editar">
            <IconButton
              color="primary"
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Apagar">
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Filtros */}
        <Grid item xs={12} sm={4}>
          <TextField
            label="Data Início"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            disabled={filters.diseaseID !== ''}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Data Fim"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            disabled={filters.diseaseID !== ''}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Doença</InputLabel>
            <Select
              name="diseaseID"
              value={filters.diseaseID}
              label="Doença"
              onChange={handleFilterChange}
            >
              <MenuItem value="">
                <em>Nenhuma</em>
              </MenuItem>
              {diseases.map((disease) => (
                <MenuItem key={disease.id} value={disease.id}>
                  {disease.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleFilter}>
            Filtrar
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={openAddDialog}
            sx={{ ml: 2 }}
          >
            Adicionar Registo
          </Button>
        </Grid>
      </Grid>

      {/* Slider de Tempo */}
      <Box sx={{ mt: 4 }}>
        <Typography id="range-slider" gutterBottom>
          Intervalo de Tempo
        </Typography>
        <Slider
          value={dateRange}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatTimestampToDate(value)}
          min={new Date(getThirtyDaysAgoDate()).getTime()}
          max={new Date(getCurrentDateTimeLocal()).getTime()}
          marks={[
            { value: new Date(getThirtyDaysAgoDate()).getTime(), label: '30 dias atrás' },
            { value: new Date(getYesterdayDate()).getTime(), label: 'Ontem' },
            { value: new Date(getCurrentDateTimeLocal()).getTime(), label: 'Hoje' },
          ]}
          sx={{ width: '100%' }}
        />
      </Box>

      {/* Gráfico */}
      <Box sx={{ mt: 4 }}>
        <FeverMedicationChart
          startDate={filters.startDate}
          endDate={filters.endDate}
          diseaseID={filters.diseaseID}
        />
      </Box>

      {/* Tabela de Registros */}
      <Box sx={{ mt: 4, height: 400 }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={records}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row.id}
          />
        )}
      </Box>

      {/* Diálogo para Adicionar Registro */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Adicionar Registo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Temperatura (°C)"
                type="number"
                inputProps={{ step: '0.1' }}
                fullWidth
                value={newRecord.temperature}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, temperature: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Medicação</InputLabel>
                <Select
                  value={newRecord.medication}
                  label="Medicação"
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, medication: e.target.value })
                  }
                >
                  <MenuItem value="">
                    <em>Nenhuma</em>
                  </MenuItem>
                  {medications.map((med) => (
                    <MenuItem key={med.id} value={med.name}>
                      {med.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data/Hora"
                type="datetime-local"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={newRecord.date_time}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, date_time: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleAddRecord}
            color="primary"
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Editar Registro */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar Registro</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Temperatura (°C)"
                type="number"
                inputProps={{ step: '0.1' }}
                fullWidth
                value={recordToEdit?.temperature || ''}
                onChange={(e) =>
                  setRecordToEdit({
                    ...recordToEdit,
                    temperature: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Medicação</InputLabel>
                <Select
                  value={recordToEdit?.medication || ''}
                  label="Medicação"
                  onChange={(e) =>
                    setRecordToEdit({
                      ...recordToEdit,
                      medication: e.target.value,
                    })
                  }
                >
                  <MenuItem value="">
                    <em>Nenhuma</em>
                  </MenuItem>
                  {medications.map((med) => (
                    <MenuItem key={med.id} value={med.name}>
                      {med.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data/Hora"
                type="datetime-local"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={
                  recordToEdit?.date_time
                    ? recordToEdit.date_time
                    : getCurrentDateTimeLocal()
                }
                onChange={(e) =>
                  setRecordToEdit({
                    ...recordToEdit,
                    date_time: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={saveEdit}
            color="primary"
            variant="contained"
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Confirmar Exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar Exclusão"}</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza de que deseja apagar este registro?
          </Typography>
          {recordToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography>
                <strong>Temperatura:</strong> {recordToDelete.temperature}°C
              </Typography>
              <Typography>
                <strong>Medicação:</strong> {recordToDelete.medication || 'Nenhuma'}
              </Typography>
              <Typography>
                <strong>Data/Hora:</strong> {new Date(recordToDelete.date_time).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Doença:</strong> {recordToDelete.disease_name || 'Nenhuma'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
            Apagar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default HealthFever;
