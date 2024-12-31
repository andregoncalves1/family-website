// frontend-react/src/views/SelectProfile.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function SelectProfile() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profileName, setProfileName] = useState('');

  // Função para buscar perfis do user logado
  const fetchProfiles = async () => {
    try {
      const response = await api.getProfiles();
      setProfiles(response.data);
    } catch (error) {
      toast.error('Erro ao carregar perfis.');
    } finally {
      setLoading(false);
    }
  };

  // Ao selecionar um profile, salvamos no localStorage e vamos à tela de febre
  const handleSelect = (profileId) => {
    localStorage.setItem('currentProfileId', profileId);
    window.dispatchEvent(new Event('storage'));
    navigate('/dashboard/health-fever');
    toast.success('Perfil selecionado.');
    window.location.reload();
  };

  const handleOpenAddModal = () => {
    setProfileName('');
    setOpenAddModal(true);
  };
  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleOpenEditModal = (profile) => {
    setCurrentProfile(profile);
    setProfileName(profile.name);
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setCurrentProfile(null);
  };

  const handleCreateProfile = async () => {
    if (profileName.trim() === '') {
      toast.error('O nome do perfil não pode estar vazio.');
      return;
    }

    try {
      await api.createProfile({ name: profileName.trim() });
      toast.success('Perfil criado com sucesso.');
      fetchProfiles();
      handleCloseAddModal();
    } catch (error) {
      toast.error('Erro ao criar perfil.');
      console.error(error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!currentProfile) return;
    if (profileName.trim() === '') {
      toast.error('O nome do perfil não pode estar vazio.');
      return;
    }

    try {
      await api.updateProfile(currentProfile.id, { name: profileName.trim() });
      toast.success('Perfil atualizado com sucesso.');
      fetchProfiles();
      handleCloseEditModal();
    } catch (error) {
      toast.error('Erro ao atualizar perfil.');
      console.error(error);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm('Tem certeza de que deseja deletar este perfil?')) {
      return;
    }
    try {
      await api.deleteProfile(profileId);
      toast.success('Perfil deletado com sucesso.');
      fetchProfiles();
    } catch (error) {
      toast.error('Erro ao deletar perfil.');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Escolher Perfil
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpenAddModal}>
          Adicionar Perfil
        </Button>
      </Grid>

      {profiles.length === 0 ? (
        <Typography>Nenhum perfil disponível. Crie um novo perfil.</Typography>
      ) : (
        <Grid container spacing={2}>
          {profiles.map((profile) => (
            <Grid item xs={12} sm={6} md={4} key={profile.id}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                <CardContent onClick={() => handleSelect(profile.id)}>
                  <Typography variant="h6" align="center">
                    {profile.name}
                  </Typography>
                </CardContent>
                <Grid container justifyContent="flex-end" sx={{ pr: 1, pb: 1 }}>
                  <Tooltip title="Editar Perfil">
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(profile);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir Perfil">
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProfile(profile.id);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal Adicionar */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal}>
        <DialogTitle>Adicionar Novo Perfil</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Perfil"
            type="text"
            fullWidth
            variant="standard"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal}>Cancelar</Button>
          <Button onClick={handleCreateProfile} variant="contained" color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Perfil"
            type="text"
            fullWidth
            variant="standard"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancelar</Button>
          <Button onClick={handleUpdateProfile} variant="contained" color="primary">
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SelectProfile;
