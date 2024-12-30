// frontend-react/src/views/HealthReports.jsx
import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import api from '../api';
import { toast } from 'react-toastify';

function HealthReports() {
  const generateReport = async () => {
    try {
      const response = await api.generateReportPDF();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio_febre_medicao.pdf');
      document.body.appendChild(link);
      link.click();
      toast.success('Relatório gerado e baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Relatórios
      </Typography>
      <Typography variant="body1" gutterBottom>
        Clique no botão para gerar e baixar o relatório em PDF.
      </Typography>
      <Button variant="contained" color="primary" onClick={generateReport}>
        Gerar Relatório
      </Button>
    </Container>
  );
}

export default HealthReports;
