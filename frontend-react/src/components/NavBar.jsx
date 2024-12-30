// frontend-react/src/components/NavBar.jsx
import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Certifique-se de importar corretamente o apiService

function NavBar() {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false); // Estado para controlar o Drawer

  // Função para navegar para rotas específicas
  const handleNavigate = (route) => {
    navigate(`/dashboard/${route}`);
    handleDrawerToggle(); // Fechar o drawer após navegar (no modo mobile)
  };

  // Função para realizar logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentProfileId');
    navigate('/login');
    handleDrawerToggle(); // Fechar o drawer após logout (no modo mobile)
  };

  // Função para buscar o nome do perfil atual
  const fetchProfileName = async () => {
    const profileId = localStorage.getItem('currentProfileId');
    if (profileId) {
      try {
        const response = await api.getProfile(profileId);
        const name = response.data.name; // Ajuste conforme a estrutura da resposta da sua API
        setProfileName(name);
      } catch (error) {
        console.error('Erro ao buscar nome do perfil:', error);
        setProfileName('Perfil Desconhecido');
      } finally {
        setLoadingProfile(false);
      }
    } else {
      setProfileName('Nenhum Perfil Selecionado');
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfileName();

    // Escutar mudanças no localStorage para atualizar o nome do perfil
    const handleStorageChange = (event) => {
      if (event.key === 'currentProfileId') {
        fetchProfileName();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função para alternar o estado do Drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Lista de itens de navegação
  const navItems = [
    { label: 'Mudar Perfil', route: 'select-profile' },
    { label: 'Febre e Medicação', route: 'health-fever' },
    { label: 'Doenças', route: 'health-diseases' },
    { label: 'Relatórios', route: 'health-reports' },
    { label: 'Gestão', route: 'management' },
  ];

  // Componente Drawer (Menu Hambúrguer)
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Saúde da Família
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              sx={{ textAlign: 'center' }}
              onClick={() => handleNavigate(item.route)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton
            sx={{ textAlign: 'center' }}
            onClick={handleLogout}
          >
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, marginBottom: 2 }}>
      <AppBar position="static">
        <Toolbar>
          {/* Ícone de Menu para Mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }} // Ocultar em telas maiores que 'sm'
          >
            <MenuIcon />
          </IconButton>

          {/* Título do Site */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Saúde da Família
          </Typography>

          {/* Exibição do Nome do Perfil Atual */}
          {loadingProfile ? (
            <CircularProgress color="inherit" size={24} sx={{ marginRight: 2 }} />
          ) : (
            <Box
              onClick={() => handleNavigate('select-profile')} // Tornar a caixa clicável
              sx={{
                border: '2px solid #FFD700', // Borda dourada para destaque
                borderRadius: '12px', // Aumentar o borderRadius para cantos mais arredondados
                padding: '8px 16px', // Aumentar o padding para uma caixa maior
                marginRight: 4,
                backgroundColor: 'rgba(255, 215, 0, 0.2)', // Fundo semi-transparente dourado
                cursor: 'pointer', // Alterar o cursor para indicar clicável
                transition: 'background-color 0.3s, border-color 0.3s', // Transições suaves
                '&:hover': {
                  backgroundColor: 'rgba(255, 215, 0, 0.3)', // Efeito de hover
                  borderColor: '#FFA500', // Borda laranja ao passar o mouse
                },
              }}
            >
              <Typography variant="h6" color="inherit">
                {profileName}
              </Typography>
            </Box>
          )}

          {/* Botões de Navegação (Desktop) */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                onClick={() => handleNavigate(item.route)}
              >
                {item.label}
              </Button>
            ))}
            <Button color="inherit" onClick={handleLogout}>
              Sair
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer para Mobile */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Melhor desempenho em dispositivos móveis
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

export default NavBar;
