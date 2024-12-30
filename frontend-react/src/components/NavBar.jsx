// frontend-react/src/components/NavBar.jsx
import React from 'react';
import { AppBar, Toolbar, Box, Typography, Button } from '@mui/material';

import { useNavigate } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();

  const handleNavigate = (route) => {
    navigate(`/dashboard/${route}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentProfileId');
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1, marginBottom: 2 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Meu Site Saúde
          </Typography>
          <Button color="inherit" onClick={() => handleNavigate('select-profile')}>
            Mudar Perfil
          </Button>
          <Button color="inherit" onClick={() => handleNavigate('health-fever')}>
            Febre e Medicação
          </Button>
          <Button color="inherit" onClick={() => handleNavigate('health-diseases')}>
            Doenças
          </Button>
          <Button color="inherit" onClick={() => handleNavigate('health-reports')}>
            Relatórios
          </Button>
          <Button color="inherit" onClick={() => handleNavigate('management')}>
            Gestão
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default NavBar;
