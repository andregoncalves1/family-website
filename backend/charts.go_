package main

import (
	"bytes"
	"errors"
	"fmt"
	"image/color"
	"image/png"
	"log"
	"time"

	"gonum.org/v1/plot"
	"gonum.org/v1/plot/plotter"
	"gonum.org/v1/plot/vg"
	"gonum.org/v1/plot/vg/draw"
	"gonum.org/v1/plot/vg/vgimg"
)

// generateChart gera o gráfico com os dados fornecidos
func generateChart(dates []time.Time, temps []float64, medications []struct {
	Date       time.Time
	Medication string
	Color      string
}, thresholds []FeverThreshold) ([]byte, error) {
	if len(dates) != len(temps) {
		return nil, errors.New("length of dates and temps must be equal")
	}

	p := plot.New()
	p.Title.Text = "Temperatura ao Longo do Tempo"
	p.X.Label.Text = "Data"
	p.Y.Label.Text = "Temperatura (°C)"

	// Preparar os dados para a linha de temperatura
	pts := make(plotter.XYs, len(dates))
	for i := range dates {
		pts[i].X = float64(dates[i].Unix())
		pts[i].Y = temps[i]
	}

	line, err := plotter.NewLine(pts)
	if err != nil {
		return nil, err
	}
	line.Color = color.RGBA{R: 0, G: 0, B: 255, A: 255} // Azul
	p.Add(line)
	p.Legend.Add("Temperatura", line)

	// Adicionar faixas de Fever Thresholds
	for _, ft := range thresholds {
		ftColor, err := parseHexColor(ft.Color)
		if err != nil {
			log.Printf("Erro ao parsear cor da Fever Threshold: %v", err)
			continue
		}

		band := plotter.NewFunction(func(x float64) float64 {
			return ft.MinTemp
		})
		band.Color = ftColor
		p.Add(band)
		p.Legend.Add(ft.Label, band)
	}

	// Adicionar linhas verticais para medicações
	for _, med := range medications {
		medColor, err := parseHexColor(med.Color)
		if err != nil {
			log.Printf("Erro ao parsear cor da medicação %s: %v", med.Medication, err)
			continue
		}

		verticalLine := plotter.NewFunction(func(x float64) float64 {
			if x == float64(med.Date.Unix()) {
				return p.Y.Max
			}
			return 0
		})
		verticalLine.Color = medColor
		verticalLine.Width = vg.Points(1)
		p.Add(verticalLine)
		p.Legend.Add(med.Medication, verticalLine)
	}

	// Formatar o eixo X para mostrar datas
	p.X.Tick.Marker = plot.TimeTicks{Format: "2006-01-02"}

	// Renderizar o gráfico em um buffer
	var buf bytes.Buffer
	width := vg.Points(600)
	height := vg.Points(300)
	canvas := vgimg.New(width, height)
	dc := draw.New(canvas)

	p.Draw(dc)

	img := canvas.Image()
	err = png.Encode(&buf, img)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// parseHexColor converte uma string hexadecimal em color.Color
func parseHexColor(s string) (color.Color, error) {
	if len(s) > 0 && s[0] == '#' {
		s = s[1:]
	}
	if len(s) != 6 {
		return nil, errors.New("formato de cor inválido")
	}
	var r, g, b uint8
	_, err := fmt.Sscanf(s, "%02x%02x%02x", &r, &g, &b)
	if err != nil {
		return nil, err
	}
	return color.RGBA{R: r, G: g, B: b, A: 255}, nil
}
