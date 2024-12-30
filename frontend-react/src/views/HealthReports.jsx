// frontend-react/src/views/HealthReports.jsx
import React, { useState } from 'react';
import { Container, Typography, Button, TextField, Box } from '@mui/material';
import api from '../api';
import { toast } from 'react-toastify';

function HealthReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const profileId = localStorage.getItem('currentProfileId');

  const generateReport = async () => {
    if (!profileId) {
      toast.error('Nenhum perfil selecionado.');
      return;
    }
    try {
      const response = await api.generateReportPDF({
        profile_id: profileId,
        start: startDate,
        end: endDate,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio_febre_medicao.pdf');
      document.body.appendChild(link);
      link.click();
      toast.success('Relatório gerado e baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório.');
      console.error(error);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Relatórios
      </Typography>
      <Typography variant="body1" gutterBottom>
        Selecione intervalo de datas e clique no botão para gerar PDF.
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="Data Início"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2 }}
        />
        <TextField
          label="Data Fim"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Button variant="contained" color="primary" onClick={generateReport}>
        Gerar Relatório
      </Button>
    </Container>
  );
}

export default HealthReports;
