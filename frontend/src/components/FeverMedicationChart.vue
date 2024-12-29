<template>
    <v-card>
      <v-card-title>Gráfico de Febre e Medicação</v-card-title>
      <v-card-text>
        <div v-if="chartOptions && series.length">
          <vue-apex-charts
            type="line"
            height="400"
            :options="chartOptions"
            :series="series"
          ></vue-apex-charts>
        </div>
        <div v-else>
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </v-card-text>
    </v-card>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted, watch } from "vue";
  import VueApexCharts from "vue3-apexcharts";
  import api from "../api";
  
  export default defineComponent({
    name: "FeverMedicationChart",
    components: {
      VueApexCharts,
    },
    props: {
      startDate: {
        type: String,
        default: "",
      },
      endDate: {
        type: String,
        default: "",
      },
      diseaseID: {
        type: String,
        default: "",
      },
    },
    setup(props) {
      const series = ref([]);
      const chartOptions = ref({});
  
      const fetchData = async () => {
        try {
          const params = {};
          if (props.startDate) params.start = props.startDate;
          if (props.endDate) params.end = props.endDate;
          if (props.diseaseID) params.disease_id = props.diseaseID;
  
          const [recordsRes, medicationsRes, thresholdsRes] = await Promise.all([
            api.getFeverMedication(params),
            api.getMedications(),
            api.getFeverThresholds(),
          ]);
  
          const records = recordsRes.data;
          const medications = medicationsRes.data;
          const thresholds = thresholdsRes.data;
  
          prepareChart(records, medications, thresholds);
        } catch (error) {
          console.error("Erro ao carregar dados do gráfico:", error);
        }
      };
  
      const prepareChart = (records, medications, thresholds) => {
        if (records.length === 0) {
          series.value = [];
          chartOptions.value = {};
          return;
        }
  
        // Ordenar registros por data
        const sortedRecords = records.sort(
          (a, b) => new Date(a.date_time) - new Date(b.date_time)
        );
  
        // Preparar dados para febre (temperatura)
        const febreData = sortedRecords.map((r) => ({
          x: new Date(r.date_time),
          y: r.temperature,
        }));
  
        // Série para febre
        series.value = [
          {
            name: "Temperatura",
            type: "line",
            data: febreData,
          },
        ];
  
        // Preparar anotações para medicações
        const medAnnotations = medications.map((med) => ({
          x: med.date_time,
          borderColor: med.color,
          strokeDashArray: 0,
          label: {
            borderColor: med.color,
            style: {
              color: "#fff",
              background: med.color,
            },
            text: med.name,
          },
        }));
  
        // Preparar anotações para faixas de febre (bandas de fundo)
        const febreAnnotations = thresholds.map((threshold) => ({
          y: threshold.min_temp,
          y2: threshold.max_temp,
          fillColor: threshold.color,
          opacity: 0.1,
          borderWidth: 0,
        }));
  
        // Definir opções do gráfico
        chartOptions.value = {
          chart: {
            type: "line",
            height: 400,
            toolbar: {
              show: true,
            },
          },
          annotations: {
            xaxis: medAnnotations,
            yaxis: febreAnnotations,
          },
          stroke: {
            width: [3],
            curve: "straight",
          },
          xaxis: {
            type: "datetime",
            title: {
              text: "Data",
            },
          },
          yaxis: {
            title: {
              text: "Temperatura (°C)",
            },
            min: 35,
            max: 42,
          },
          tooltip: {
            shared: true,
            intersect: false,
            x: {
              format: "dd/MM/yyyy HH:mm",
            },
          },
          markers: {
            size: 5,
          },
          responsive: [
            {
              breakpoint: 600,
              options: {
                chart: {
                  height: 300,
                },
                legend: {
                  position: "bottom",
                },
              },
            },
          ],
          legend: {
            position: "top",
            horizontalAlign: "left",
          },
        };
      };
  
      onMounted(() => {
        fetchData();
      });
  
      watch(
        () => [props.startDate, props.endDate, props.diseaseID],
        () => {
          fetchData();
        }
      );
  
      return {
        series,
        chartOptions,
      };
    },
  });
  </script>
  
  <style scoped>
  /* Estilos adicionais se necessário */
  </style>
  