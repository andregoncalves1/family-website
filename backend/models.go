// models.go
package main

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// CustomTime representa um tempo personalizado que aceita o formato "2006-01-02T15:04"
type CustomTime struct {
	time.Time
}

// UnmarshalJSON implementa a interface json.Unmarshaler
func (ct *CustomTime) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), "\"")

	// Define o layout esperado
	layout := "2006-01-02T15:04"

	t, err := time.Parse(layout, s)
	if err != nil {
		return fmt.Errorf("invalid date format: %s, expected format: %s", s, layout)
	}
	ct.Time = t
	return nil
}

// MarshalJSON implementa a interface json.Marshaler
func (ct CustomTime) MarshalJSON() ([]byte, error) {
	return json.Marshal(ct.Time.Format("2006-01-02T15:04"))
}

// Implementar driver.Valuer para CustomTime
func (ct CustomTime) Value() (driver.Value, error) {
	return ct.Time, nil
}

// Implementar sql.Scanner para CustomTime
func (ct *CustomTime) Scan(value interface{}) error {
	if value == nil {
		ct.Time = time.Time{}
		return nil
	}
	switch v := value.(type) {
	case time.Time:
		ct.Time = v
		return nil
	case string:
		t, err := time.Parse(time.RFC3339, v)
		if err != nil {
			return err
		}
		ct.Time = t
		return nil
	default:
		return fmt.Errorf("unsupported type for CustomTime: %T", value)
	}
}

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
	ID          int        `json:"id"`
	ProfileID   int        `json:"profile_id" binding:"required,gt=0"`
	Temperature float64    `json:"temperature" binding:"omitempty,gte=35,lte=42"`
	Medication  string     `json:"medication" binding:"omitempty,min=1,max=255"`
	DateTime    CustomTime `json:"date_time" binding:"required"`
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

type FeverMedicationRecordWithDisease struct {
	ID          int       `json:"id"`
	ProfileID   int       `json:"profile_id"`
	Temperature float64   `json:"temperature"`
	Medication  string    `json:"medication"`
	DateTime    time.Time `json:"date_time"`
	DiseaseID   *int      `json:"disease_id,omitempty"`
	DiseaseName *string   `json:"disease_name,omitempty"`
}

// FeverMedicationUpdateRequest representa a estrutura dos dados enviados para atualização
type FeverMedicationUpdateRequest struct {
	Temperature *float64   `json:"temperature" binding:"omitempty,gte=35,lte=42"`
	Medication  *string    `json:"medication" binding:"omitempty,min=1,max=255"`
	DateTime    *time.Time `json:"date_time" binding:"omitempty"`
}
