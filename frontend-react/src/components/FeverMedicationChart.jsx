// frontend-react/src/components/FeverMedicationChart.jsx
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import api from '../api';
import { Box, CircularProgress, Typography } from '@mui/material';

function FeverMedicationChart({ startDate, endDate, diseaseID }) {
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);

  // Função para converter hex para RGBA, adicionando '#' se necessário
  const hexToRGBA = (hex, alpha) => {
    let r = 0, g = 0, b = 0;

    // Adicionar '#' se ausente
    if (!hex.startsWith('#')) {
      hex = `#${hex}`;
    }

    // 3 dígitos
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 dígitos
    else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }

    return `rgba(${r},${g},${b},${alpha})`;
  };

  // Função para obter a cor da medicação com opacidade
  const getMedicationColor = (medName, medications) => {
    const med = medications.find((m) => m.name === medName);
    if (med && med.color) {
      const color = hexToRGBA(med.color, 0.8);
      console.log(`Medicação: ${medName}, Cor: ${color}`);
      return color;
    }
    return 'rgba(0,0,0,0.3)'; // Cor padrão com 30% de opacidade
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // ADIÇÃO: ler profileId
      const profileId = localStorage.getItem('currentProfileId');
      if (!profileId) {
        console.error('Nenhum profile selecionado.'); 
        // Se quiseres não chamar a API, podes dar return aqui
      }

      const params = {};
      // ADIÇÃO: incluir profile_id
      params.profile_id = profileId; // se não tiver, backend não filtra
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;
      if (diseaseID) params.disease_id = diseaseID;

      // Chama as 3 APIs com esse param
      const [recordsRes, medicationsRes, thresholdsRes] = await Promise.all([
        api.getFeverMedication(params),       // agora envia ?profile_id=XX&start=... 
        api.getMedications(profileId),        // agora envia ?profile_id=XX
        api.getFeverThresholds(profileId),    // agora envia ?profile_id=XX
      ]);

      const records = recordsRes.data;
      const medications = medicationsRes.data;
      const thresholds = thresholdsRes.data;

      prepareChart(records, medications, thresholds);
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChart = (records, medications, thresholds) => {
    if (records.length === 0) {
      setSeries([]);
      setOptions({});
      return;
    }

    // Ordenar registros por data/hora
    const sortedRecords = records.sort(
      (a, b) => new Date(a.date_time) - new Date(b.date_time)
    );

    // Filtrar registros com temperatura diferente de 0
    const filteredRecords = sortedRecords.filter(r => r.temperature !== 0);

    // Preparar dados para a temperatura
    const febreData = filteredRecords.map((r) => ({
      x: new Date(r.date_time).getTime(), // Timestamp em milissegundos
      y: r.temperature,
    }));

    // Série para temperatura
    const newSeries = [
      {
        name: 'Temperatura',
        type: 'line',
        data: febreData,
      },
    ];

    // Anotações para medicações
    const medAnnotations = sortedRecords
      .filter((r) => r.medication)
      .map((r) => ({
        x: new Date(r.date_time).getTime(),
        borderColor: getMedicationColor(r.medication, medications),
        strokeDashArray: 4, // Linha tracejada
        strokeWidth: 2, // Linha mais fina
        zIndex: 5,
        label: {
          borderColor: getMedicationColor(r.medication, medications),
          style: {
            color: '#fff',
            background: getMedicationColor(r.medication, medications),
          },
          text: r.medication,
          position: 'top',
          offsetY: -10,
        },
      }));

    // Anotações para os limites de febre
    const febreAnnotations = thresholds.map((threshold) => ({
      y: threshold.min_temp,
      y2: threshold.max_temp,
      fillColor: hexToRGBA(threshold.color, 1.0),
      opacity: 0.1,
      borderWidth: 0,
    }));

    // Calcular os timestamps para min e max do eixo X
    const minTimestamp = new Date(startDate).setHours(0, 0, 0, 0);
    const maxTimestamp = new Date(endDate).setHours(23, 59, 59, 999);

    // Configuração das opções do gráfico
    setSeries(newSeries);
    setOptions({
      chart: {
        type: 'line',
        height: 400,
        toolbar: { show: true },
      },
      annotations: {
        xaxis: medAnnotations,
        yaxis: febreAnnotations.map((ft) => ({
          y: ft.y,
          y2: ft.y2,
          fillColor: ft.fillColor,
          opacity: ft.opacity,
          borderWidth: ft.borderWidth,
          zIndex: 0,
        })),
      },
      stroke: {
        width: [3],
        curve: 'straight',
      },
      xaxis: {
        type: 'datetime',
        title: { text: 'Data' },
        min: minTimestamp,
        max: maxTimestamp,
      },
      yaxis: {
        title: { text: 'Temperatura (°C)' },
        min: 35,
        max: 42,
      },
      tooltip: {
        shared: true,
        intersect: false,
        x: { format: 'dd/MM/yyyy HH:mm' },
      },
      markers: { size: 5 },
      responsive: [
        {
          breakpoint: 600,
          options: {
            chart: { height: 300 },
            legend: { position: 'bottom' },
          },
        },
      ],
      legend: {
        position: 'top',
        horizontalAlign: 'left',
      },
    });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, diseaseID]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!series.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography variant="h6">Nenhum dado disponível para o gráfico.</Typography>
      </Box>
    );
  }

  return (
    <ReactApexChart options={options} series={series} type="line" height={400} />
  );
}

export default FeverMedicationChart;
