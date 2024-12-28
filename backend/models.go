// models.go
package main

import (
	"time"
)

// User representa um utilizador
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"-" binding:"required,min=6"`
}

// Profile representa um perfil de saúde
type Profile struct {
	ID   int    `json:"id"`
	Name string `json:"name" binding:"required,min=3,max=100"`
}

// FeverMedicationRecord representa um registro de febre e medicação
type FeverMedicationRecord struct {
	ID          int       `json:"id"`
	ProfileID   int       `json:"profile_id" binding:"required,gt=0"`
	Temperature float64   `json:"temperature" binding:"omitempty,gte=35,lte=42"`
	Medication  string    `json:"medication" binding:"omitempty,min=1,max=255"`
	DateTime    time.Time `json:"date_time" binding:"required"`
	DiseaseID   *int      `json:"disease_id" binding:"omitempty,gt=0"`
	DiseaseName *string   `json:"disease_name"`
}

// Disease representa uma doença
type Disease struct {
	ID        int        `json:"id"`
	Name      string     `json:"name" binding:"required,min=3,max=100"`
	StartDate time.Time  `json:"start_date" binding:"required"`
	EndDate   *time.Time `json:"end_date" binding:"omitempty"`
}

// Medication representa uma medicação
type Medication struct {
	ID    int    `json:"id"`
	Name  string `json:"name" binding:"required,min=1,max=100"`
	Color string `json:"color" binding:"required,hexcolor"`
}

// FeverThreshold representa uma faixa de febre
type FeverThreshold struct {
	ID      int     `json:"id"`
	Label   string  `json:"label" binding:"required,min=1,max=50"`
	MinTemp float64 `json:"min_temp" binding:"required,gte=0"`
	MaxTemp float64 `json:"max_temp" binding:"required,gtfield=MinTemp"`
	Color   string  `json:"color" binding:"required,hexcolor"`
}
