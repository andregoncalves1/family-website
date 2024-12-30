// frontend-react/src/views/Management.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api';

function Management() {
  // Users
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [savingUser, setSavingUser] = useState(false);

  // Profiles
  const [newProfile, setNewProfile] = useState({ name: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Medications
  const [medications, setMedications] = useState([]);
  const [medLoading, setMedLoading] = useState(true);
  const [medDialogOpen, setMedDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(false);
  const [currentMed, setCurrentMed] = useState({ id: null, name: '', color: '' });
  const [savingMed, setSavingMed] = useState(false);

  // Fever Thresholds
  const [thresholds, setThresholds] = useState([]);
  const [ftLoading, setFtLoading] = useState(true);
  const [ftDialogOpen, setFtDialogOpen] = useState(false);
  const [editingFT, setEditingFT] = useState(false);
  const [currentFT, setCurrentFT] = useState({
    id: null,
    label: '',
    min_temp: '',
    max_temp: '',
    color: '',
  });
  const [savingFT, setSavingFT] = useState(false);

  // Fetch Medications
  const fetchMedications = async () => {
    setMedLoading(true);
    try {
      // ADIÇÃO: ler profileId
      const profileId = localStorage.getItem('currentProfileId');
      const response = await api.getMedications(profileId);
      setMedications(response.data);
    } catch (error) {
      toast.error('Erro ao carregar medicações.');
    } finally {
      setMedLoading(false);
    }
  };

  // Fetch Fever Thresholds
  const fetchThresholds = async () => {
    setFtLoading(true);
    try {
      // ADIÇÃO: ler profileId
      const profileId = localStorage.getItem('currentProfileId');
      const response = await api.getFeverThresholds(profileId);
      setThresholds(response.data);
    } catch (error) {
      toast.error('Erro ao carregar Fever Thresholds.');
    } finally {
      setFtLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
    fetchThresholds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================== USER MANAGEMENT ==================
  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast.error('Preencha todos os campos de usuário.');
      return;
    }
    setSavingUser(true);
    try {
      await api.createUser(newUser);
      toast.success('Usuário criado com sucesso!');
      setNewUser({ username: '', password: '' });
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Erro ao criar usuário.';
      toast.error(errorMsg);
    } finally {
      setSavingUser(false);
    }
  };

  // ================== PROFILE MANAGEMENT ==================
  const handleCreateProfile = async () => {
    if (!newProfile.name) {
      toast.error('Preencha o nome do perfil.');
      return;
    }
    setSavingProfile(true);
    try {
      await api.createProfile(newProfile);
      toast.success('Perfil criado com sucesso!');
      setNewProfile({ name: '' });
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Erro ao criar perfil.';
      toast.error(errorMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  // ================== MEDICATION MANAGEMENT ==================
  const handleOpenMedDialog = () => {
    setEditingMed(false);
    setCurrentMed({ id: null, name: '', color: '' });
    setMedDialogOpen(true);
  };

  const handleEditMed = (med) => {
    setEditingMed(true);
    setCurrentMed({ ...med });
    setMedDialogOpen(true);
  };

  const handleCloseMedDialog = () => {
    setMedDialogOpen(false);
  };

  const handleSaveMed = async () => {
    const { id, name, color } = currentMed;
    if (!name || !color || !/^#([A-Fa-f0-9]{6})$/.test(color)) {
      toast.error('Preencha corretamente todos os campos da medicação.');
      return;
    }
    setSavingMed(true);
    try {
      // ADIÇÃO: ler profileId
      const profileId = localStorage.getItem('currentProfileId');
      if (!profileId) {
        toast.error('Nenhum perfil selecionado.');
        setSavingMed(false);
        return;
      }

      const payload = {
        name,
        color: color.replace('#', ''),
        profile_id: parseInt(profileId, 10), // ADIÇÃO
      };

      if (editingMed) {
        await api.updateMedication(id, payload);
        toast.success('Medicação atualizada com sucesso!');
      } else {
        await api.addMedication(payload);
        toast.success('Medicação adicionada com sucesso!');
      }
      fetchMedications();
      handleCloseMedDialog();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Erro ao salvar medicação.';
      toast.error(errorMsg);
    } finally {
      setSavingMed(false);
    }
  };

  const handleDeleteMed = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta medicação?')) {
      return;
    }
    try {
      await api.deleteMedication(id);
      toast.success('Medicação deletada com sucesso!');
      fetchMedications();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Erro ao deletar medicação.';
      toast.error(errorMsg);
    }
  };

  // ================== FEVER THRESHOLD MANAGEMENT ==================
  const handleOpenFTDialog = () => {
    setEditingFT(false);
    setCurrentFT({
      id: null,
      label: '',
      min_temp: '',
      max_temp: '',
      color: '',
    });
    setFtDialogOpen(true);
  };

  const handleEditFT = (ft) => {
    setEditingFT(true);
    setCurrentFT({
      id: ft.id,
      label: ft.label,
      min_temp: ft.min_temp.toString(),
      max_temp: ft.max_temp.toString(),
      color: `#${ft.color}`,
    });
    setFtDialogOpen(true);
  };

  const handleCloseFTDialog = () => {
    setFtDialogOpen(false);
  };

  const handleSaveFT = async () => {
    const { id, label, min_temp, max_temp, color } = currentFT;
    if (
      !label ||
      !min_temp ||
      !max_temp ||
      !color ||
      isNaN(min_temp) ||
      isNaN(max_temp) ||
      parseFloat(min_temp) >= parseFloat(max_temp) ||
      !/^#([A-Fa-f0-9]{6})$/.test(color)
    ) {
      toast.error('Preencha corretamente todos os campos da Fever Threshold.');
      return;
    }
    setSavingFT(true);
    try {
      // ADIÇÃO: ler profileId
      const profileId = localStorage.getItem('currentProfileId');
      if (!profileId) {
        toast.error('Nenhum perfil selecionado.');
        setSavingFT(false);
        return;
      }

      const payload = {
        label,
        min_temp: parseFloat(min_temp),
        max_temp: parseFloat(max_temp),
        color: color.replace('#', ''),
        profile_id: parseInt(profileId, 10), // ADIÇÃO
      };
      if (editingFT) {
        await api.updateFeverThreshold(id, payload);
        toast.success('Fever Threshold atualizada com sucesso!');
      } else {
        await api.addFeverThreshold(payload);
        toast.success('Fever Threshold adicionada com sucesso!');
      }
      fetchThresholds();
      setFtLoading(false);
      handleCloseFTDialog();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Erro ao salvar Fever Threshold.';
      toast.error(errorMsg);
    } finally {
      setSavingFT(false);
    }
  };

  const handleDeleteFT = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta Fever Threshold?')) {
      return;
    }
    try {
      await api.deleteFeverThreshold(id);
      toast.success('Fever Threshold deletada com sucesso!');
      fetchThresholds();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Erro ao deletar Fever Threshold.';
      toast.error(errorMsg);
    }
  };

  const medColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nome', flex: 1 },
    {
      field: 'color',
      headerName: 'Cor',
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            backgroundColor: `#${params.value}`,
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          #{params.value}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <>
          <Tooltip title="Editar">
            <IconButton
              color="primary"
              onClick={() => handleEditMed(params.row)}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deletar">
            <IconButton
              color="error"
              onClick={() => handleDeleteMed(params.row.id)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  const ftColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'label', headerName: 'Label', flex: 1 },
    {
      field: 'min_temp',
      headerName: 'Temp Mínima (°C)',
      flex: 1,
    },
    {
      field: 'max_temp',
      headerName: 'Temp Máxima (°C)',
      flex: 1,
    },
    {
      field: 'color',
      headerName: 'Cor',
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            backgroundColor: `#${params.value}`,
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          #{params.value}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <>
          <Tooltip title="Editar">
            <IconButton
              color="primary"
              onClick={() => handleEditFT(params.row)}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deletar">
            <IconButton
              color="error"
              onClick={() => handleDeleteFT(params.row.id)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Gestão
      </Typography>

      <Grid container spacing={4}>
        {/* Criar Novo Utilizador */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Criar Novo Utilizador
              </Typography>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateUser}
                disabled={savingUser}
              >
                {savingUser ? 'Criando...' : 'Criar'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Criar Novo Perfil */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Criar Novo Perfil
              </Typography>
              <TextField
                label="Nome do Perfil"
                fullWidth
                margin="normal"
                value={newProfile.name}
                onChange={(e) =>
                  setNewProfile({ ...newProfile, name: e.target.value })
                }
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateProfile}
                disabled={savingProfile}
              >
                {savingProfile ? 'Criando...' : 'Criar'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gestão de Medicações */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gestão de Medicações
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenMedDialog}
                sx={{ mb: 2 }}
              >
                Adicionar Medicação
              </Button>
              <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={medications}
                  columns={medColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  loading={medLoading}
                  autoHeight
                  disableSelectionOnClick
                />
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Gestão de Fever Thresholds */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gestão de Fever Thresholds
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenFTDialog}
                sx={{ mb: 2 }}
              >
                Adicionar Fever Threshold
              </Button>
              <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={thresholds}
                  columns={ftColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  loading={ftLoading}
                  autoHeight
                  disableSelectionOnClick
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Medication Dialog */}
      <Dialog open={medDialogOpen} onClose={handleCloseMedDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingMed ? 'Editar Medicação' : 'Adicionar Medicação'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Nome da Medicação"
                fullWidth
                required
                value={currentMed.name}
                onChange={(e) =>
                  setCurrentMed({ ...currentMed, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Cor da Medicação (Hex)"
                fullWidth
                required
                value={currentMed.color}
                onChange={(e) =>
                  setCurrentMed({ ...currentMed, color: e.target.value })
                }
                placeholder="#FFFFFF"
                helperText="Formato hexadecimal, ex: #FF5733"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMedDialog} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveMed}
            color="primary"
            variant="contained"
            disabled={savingMed}
          >
            {savingMed ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fever Threshold Dialog */}
      <Dialog open={ftDialogOpen} onClose={handleCloseFTDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingFT ? 'Editar Fever Threshold' : 'Adicionar Fever Threshold'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Label"
                fullWidth
                required
                value={currentFT.label}
                onChange={(e) =>
                  setCurrentFT({ ...currentFT, label: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Temperatura Mínima (°C)"
                type="number"
                fullWidth
                required
                inputProps={{ step: '0.1' }}
                value={currentFT.min_temp}
                onChange={(e) =>
                  setCurrentFT({ ...currentFT, min_temp: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Temperatura Máxima (°C)"
                type="number"
                fullWidth
                required
                inputProps={{ step: '0.1' }}
                value={currentFT.max_temp}
                onChange={(e) =>
                  setCurrentFT({ ...currentFT, max_temp: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Cor da Faixa (Hex)"
                fullWidth
                required
                value={currentFT.color}
                onChange={(e) =>
                  setCurrentFT({ ...currentFT, color: e.target.value })
                }
                placeholder="#FF5733"
                helperText="Formato hexadecimal, ex: #FF5733"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFTDialog} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveFT}
            color="primary"
            variant="contained"
            disabled={savingFT}
          >
            {savingFT ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Management;
