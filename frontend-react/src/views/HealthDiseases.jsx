// frontend-react/src/views/HealthDiseases.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../api';

function HealthDiseases() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentDisease, setCurrentDisease] = useState({
    id: null,
    name: '',
    start_date: '',
    end_date: '',
  });
  const [saving, setSaving] = useState(false);

  // Função para sanitizar e garantir que cada doença tenha 'start_date' e 'end_date'
  const sanitizeDiseases = (fetchedDiseases) => {
    if (!Array.isArray(fetchedDiseases)) return [];

    return fetchedDiseases.map((disease) => ({
      ...disease,
      start_date: disease.start_date ? disease.start_date : '',
      end_date: disease.end_date ? disease.end_date : '',
    }));
  };

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      // ADIÇÃO: ler profileId
      const profileId = localStorage.getItem('currentProfileId');
      const response = await api.getDiseases(profileId);
      const sanitizedDiseases = sanitizeDiseases(response.data);
      console.log('Doenças Sanitizadas:', sanitizedDiseases);
      setDiseases(sanitizedDiseases);
    } catch (error) {
      toast.error('Erro ao carregar doenças.');
      console.error('Erro ao carregar doenças:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setEditing(false);
    setCurrentDisease({
      id: null,
      name: '',
      start_date: '',
      end_date: '',
    });
    setOpen(true);
  };

  const handleEdit = (disease) => {
    setEditing(true);
    setCurrentDisease({
      id: disease.id,
      name: disease.name,
      start_date: disease.start_date ? disease.start_date.slice(0, 16) : '',
      end_date: disease.end_date ? disease.end_date.slice(0, 16) : '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // ADIÇÃO: ler profileId
      const profileId = localStorage.getItem('currentProfileId');
      if (!profileId) {
        toast.error('Nenhum perfil selecionado.');
        setSaving(false);
        return;
      }

      const payload = {
        name: currentDisease.name,
        start_date: currentDisease.start_date
          ? new Date(currentDisease.start_date).toISOString()
          : null,
        end_date: currentDisease.end_date
          ? new Date(currentDisease.end_date).toISOString()
          : null,
        profile_id: parseInt(profileId, 10), // ADIÇÃO
      };

      let response;
      if (editing) {
        response = await api.updateDisease(currentDisease.id, payload);
        toast.success('Doença atualizada com sucesso!');
      } else {
        response = await api.addDisease(payload);
        toast.success('Doença adicionada com sucesso!');
      }

      console.log('Resposta da API:', response.data);
      fetchDiseases();
      handleClose();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Erro ao salvar doença.';
      toast.error(errorMsg);
      console.error('Erro ao salvar doença:', error.response?.data || error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta doença?')) {
      return;
    }
    try {
      await api.deleteDisease(id);
      toast.success('Doença deletada com sucesso!');
      fetchDiseases();
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || 'Erro ao deletar doença.';
      toast.error(errorMsg);
      console.error('Erro ao deletar doença:', error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchDiseases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nome', flex: 1 },
    {
      field: 'start_date',
      headerName: 'Data Início',
      flex: 1,
      renderCell: (params) => {
        const date = params.row.start_date ? new Date(params.row.start_date) : null;
        return (
          <span>
            {date && !isNaN(date) ? date.toLocaleString() : 'N/A'}
          </span>
        );
      },
    },
    {
      field: 'end_date',
      headerName: 'Data Fim',
      flex: 1,
      renderCell: (params) => {
        const date = params.row.end_date ? new Date(params.row.end_date) : null;
        return (
          <span>
            {date && !isNaN(date) ? date.toLocaleString() : 'Em curso...'}
          </span>
        );
      },
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
              onClick={() => handleEdit(params.row)}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deletar">
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row.id)}
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
        Doenças
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Adicionar Doença
      </Button>

      <Grid container sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <DataGrid
            rows={diseases}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            loading={loading}
            autoHeight
            disableSelectionOnClick
            getRowId={(row) => row.id}
          />
        </Grid>
      </Grid>

      {/* Add/Edit Disease Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? 'Editar Doença' : 'Adicionar Doença'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Nome da Doença"
                fullWidth
                required
                value={currentDisease.name}
                onChange={(e) =>
                  setCurrentDisease({ ...currentDisease, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data Início"
                type="datetime-local"
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                value={currentDisease.start_date}
                onChange={(e) =>
                  setCurrentDisease({
                    ...currentDisease,
                    start_date: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data Fim"
                type="datetime-local"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={currentDisease.end_date}
                onChange={(e) =>
                  setCurrentDisease({
                    ...currentDisease,
                    end_date: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default HealthDiseases;
