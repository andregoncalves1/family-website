// frontend-react/src/views/SelectProfile.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function SelectProfile() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleSelect = (profileId) => {
    localStorage.setItem('currentProfileId', profileId);
    navigate('/dashboard/health-fever');
    toast.success('Perfil selecionado.');
  };

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!profiles || profiles.length === 0) {
    return <div>Nenhum perfil disponível. Por favor, crie um novo perfil.</div>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Escolher Perfil
      </Typography>
      <Grid container spacing={2}>
        {profiles.map((profile) => (
          <Grid item xs={12} sm={6} md={4} key={profile.id}>
            <Card
              onClick={() => handleSelect(profile.id)}
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
            >
              <CardContent>
                <Typography variant="h6" align="center">
                  {profile.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default SelectProfile;
