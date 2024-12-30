// handlers.go
package main

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v4"
	"github.com/phpdave11/gofpdf"
)

// loginHandler (igual ao teu atual, sem a criação de profile "exemplo" automática)
func loginHandler(c *gin.Context) {
	log.Println("Login Handler.")

	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]string, len(ve))
			for i, fe := range ve {
				out[i] = fmt.Sprintf("Campo '%s' falhou na validação '%s'", fe.Field(), fe.Tag())
			}
			c.JSON(http.StatusBadRequest, gin.H{"errors": out})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	var user User
	row := db.QueryRow("SELECT id, username, password FROM users WHERE username=$1", req.Username)
	if err := row.Scan(&user.ID, &user.Username, &user.Password); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar utilizador"})
		return
	}

	// Verificar senha
	if !checkPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Senha incorreta"})
		return
	}

	// Verificar se o user possui perfis. Caso não tenha, criar "exemplo".
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM profiles WHERE user_id=$1", user.ID).Scan(&count)
	if err != nil {
		log.Printf("Erro ao verificar perfis do usuário: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar perfis"})
		return
	}
	if count == 0 {
		log.Printf("Usuário '%s' (ID %d) não possui perfis. Criando 'exemplo'...", user.Username, user.ID)
		_, err = db.Exec("INSERT INTO profiles (name, user_id) VALUES ($1, $2)", "exemplo", user.ID)
		if err != nil {
			log.Printf("Erro ao criar profile 'exemplo': %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar perfil padrão"})
			return
		}
	}

	// Gerar token JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenStr, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token"})
		return
	}

	log.Println("Fim de login Handler.")
	c.JSON(http.StatusOK, gin.H{"token": tokenStr})
}

// createUser (igual ao teu)
func createUser(c *gin.Context) {
	var req User
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]string, len(ve))
			for i, fe := range ve {
				out[i] = fmt.Sprintf("Campo '%s' falhou na validação '%s'", fe.Field(), fe.Tag())
			}
			c.JSON(http.StatusBadRequest, gin.H{"errors": out})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha"})
		return
	}

	_, err = db.Exec("INSERT INTO users (username, password) VALUES ($1, $2)", req.Username, hashedPassword)
	if err != nil {
		log.Printf("Erro ao criar utilizador: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao criar utilizador"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Utilizador criado com sucesso"})
}

// =============================
//          PERFIS
// =============================

// getProfiles obtém todos os perfis do usuário logado
func getProfiles(c *gin.Context) {
	userIDAny, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}
	userID := userIDAny.(int)

	rows, err := db.Query("SELECT id, name, user_id FROM profiles WHERE user_id=$1", userID)
	if err != nil {
		log.Printf("Erro ao obter perfis: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter perfis"})
		return
	}
	defer rows.Close()

	var profiles []Profile
	for rows.Next() {
		var p Profile
		if err := rows.Scan(&p.ID, &p.Name, &p.UserID); err != nil {
			log.Println("Erro ao escanear perfil:", err)
			continue
		}
		profiles = append(profiles, p)
	}

	c.JSON(http.StatusOK, profiles)
}

// createProfile cria um novo perfil para o usuário logado
func createProfile(c *gin.Context) {
	userIDAny, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}
	userID := userIDAny.(int)

	var req Profile
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]string, len(ve))
			for i, fe := range ve {
				out[i] = fmt.Sprintf("Campo '%s' falhou na validação '%s'", fe.Field(), fe.Tag())
			}
			c.JSON(http.StatusBadRequest, gin.H{"errors": out})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	_, err := db.Exec("INSERT INTO profiles (name, user_id) VALUES ($1, $2)", req.Name, userID)
	if err != nil {
		log.Printf("Erro ao criar perfil: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao criar perfil"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Perfil criado com sucesso"})
}

// getProfileByID obtém um perfil por ID, mas só se pertencer ao user logado
func getProfileByID(c *gin.Context) {
	userIDAny, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}
	userID := userIDAny.(int)

	id := c.Param("id")
	var p Profile
	err := db.QueryRow(
		"SELECT id, name, user_id FROM profiles WHERE id=$1 AND user_id=$2",
		id, userID,
	).Scan(&p.ID, &p.Name, &p.UserID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado"})
		} else {
			log.Printf("Erro ao obter perfil: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter perfil"})
		}
		return
	}

	c.JSON(http.StatusOK, p)
}

// updateProfile atualiza um perfil, mas só se pertencer ao user logado
func updateProfile(c *gin.Context) {
	userIDAny, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}
	userID := userIDAny.(int)

	id := c.Param("id")
	var req Profile
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]string, len(ve))
			for i, fe := range ve {
				out[i] = fmt.Sprintf("Campo '%s' falhou na validação '%s'", fe.Field(), fe.Tag())
			}
			c.JSON(http.StatusBadRequest, gin.H{"errors": out})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	result, err := db.Exec(
		"UPDATE profiles SET name=$1 WHERE id=$2 AND user_id=$3",
		req.Name, id, userID,
	)
	if err != nil {
		log.Printf("Erro ao atualizar perfil: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao atualizar perfil"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar atualização"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado ou não pertence a você"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Perfil atualizado com sucesso"})
}

// deleteProfile deleta um perfil, mas só se pertencer ao user logado
func deleteProfile(c *gin.Context) {
	userIDAny, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}
	userID := userIDAny.(int)

	id := c.Param("id")
	result, err := db.Exec("DELETE FROM profiles WHERE id=$1 AND user_id=$2", id, userID)
	if err != nil {
		log.Printf("Erro ao deletar perfil: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao deletar perfil"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar deleção"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado ou não pertence a você"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Perfil deletado com sucesso"})
}

// getFeverMedication lida com GET /api/fevermedications
func getFeverMedication(c *gin.Context) {
	// Obter parâmetros de consulta
	startDate := c.Query("start")
	endDate := c.Query("end")
	profileID := c.Query("profile_id")

	if profileID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'profile_id' é obrigatório"})
		return
	}
	if startDate == "" || endDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetros 'start' e 'end' são obrigatórios"})
		return
	}

	// Incrementar endDate em 1 dia para incluir o final do dia
	endTime, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido para 'end'"})
		return
	}
	endTime = endTime.AddDate(0, 0, 1)
	formattedEnd := endTime.Format("2006-01-02")

	// =============================
	// AJUSTE: LEFT JOIN com diseases
	// =============================
	query := `
SELECT 
  r.id,
  r.profile_id,
  r.temperature,
  r.medication,
  r.date_time,
  COALESCE(d.name, '') AS disease_name
FROM fever_medication_records r
LEFT JOIN diseases d
       ON r.profile_id = d.profile_id
      AND r.date_time >= d.start_date
      AND (
          d.end_date IS NULL
          OR r.date_time <= d.end_date
      )
WHERE r.profile_id = $1
  AND r.date_time >= $2
  AND r.date_time < $3
ORDER BY r.date_time DESC
`
	rows, err := db.Query(query, profileID, startDate, formattedEnd)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar registros"})
		return
	}
	defer rows.Close()

	var records []map[string]interface{}
	for rows.Next() {
		var record struct {
			ID          int             `json:"id"`
			ProfileID   int             `json:"profile_id"`
			Temperature sql.NullFloat64 `json:"temperature"`
			Medication  sql.NullString  `json:"medication"`
			DateTime    string          `json:"date_time"`
			DiseaseName sql.NullString  `json:"disease_name"`
		}
		if err := rows.Scan(
			&record.ID,
			&record.ProfileID,
			&record.Temperature,
			&record.Medication,
			&record.DateTime,
			&record.DiseaseName,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar registros"})
			return
		}

		recordMap := map[string]interface{}{
			"id":          record.ID,
			"profile_id":  record.ProfileID,
			"temperature": record.Temperature.Float64,
			"medication":  record.Medication.String,
			"date_time":   record.DateTime,
			"disease_name": func() string {
				if record.DiseaseName.Valid {
					return record.DiseaseName.String
				}
				return ""
			}(),
		}

		records = append(records, recordMap)
	}

	c.JSON(http.StatusOK, records)
}

// addFeverMedication adiciona um novo registro de febre e medicação sem disease_id
func addFeverMedication(c *gin.Context) {
	var payload struct {
		ProfileID   int     `json:"profile_id" binding:"required"`
		Temperature float64 `json:"temperature"`
		Medication  string  `json:"medication"`
		DateTime    string  `json:"date_time" binding:"required"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		INSERT INTO fever_medication_records (profile_id, temperature, medication, date_time)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`
	var id int
	err := db.QueryRow(query, payload.ProfileID, payload.Temperature, payload.Medication, payload.DateTime).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao adicionar registro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registro adicionado com sucesso", "id": id})
}

// updateFeverMedication atualiza um registro existente sem disease_id
func updateFeverMedication(c *gin.Context) {
	id := c.Param("id")

	var payload struct {
		Temperature float64 `json:"temperature"`
		Medication  string  `json:"medication"`
		DateTime    string  `json:"date_time"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		UPDATE fever_medication_records
		   SET temperature = $1, medication = $2, date_time = $3
		 WHERE id = $4
	`
	res, err := db.Exec(query, payload.Temperature, payload.Medication, payload.DateTime, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar registro"})
		return
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar atualização"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Registro não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registro atualizado com sucesso"})
}

// deleteFeverMedication apaga um registro existente de febre e medicação
func deleteFeverMedication(c *gin.Context) {
	idParam := c.Param("id")
	if idParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do registro é obrigatório"})
		return
	}

	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do registro inválido"})
		return
	}

	result, err := db.Exec("DELETE FROM fever_medication_records WHERE id=$1", id)
	if err != nil {
		log.Printf("Erro ao apagar registro: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao apagar registro"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar deleção"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Registro não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registro apagado com sucesso"})
}

// getDiseases obtém todas as doenças para um profile_id
func getDiseases(c *gin.Context) {
	profileID := c.Query("profile_id")
	if profileID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'profile_id' é obrigatório"})
		return
	}

	rows, err := db.Query("SELECT id, name, start_date, end_date, profile_id FROM diseases WHERE profile_id = $1", profileID)
	if err != nil {
		log.Printf("Erro ao obter doenças: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter doenças"})
		return
	}
	defer rows.Close()

	var diseases []Disease
	for rows.Next() {
		var d Disease
		if err := rows.Scan(&d.ID, &d.Name, &d.StartDate, &d.EndDate, &d.ProfileID); err != nil {
			log.Println("Erro ao escanear doença:", err)
			continue
		}
		diseases = append(diseases, d)
	}

	if len(diseases) == 0 {
		diseases = []Disease{}
	}

	c.JSON(http.StatusOK, diseases)
}

// addDisease adiciona uma nova doença
func addDisease(c *gin.Context) {
	var req Disease
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]string, len(ve))
			for i, fe := range ve {
				out[i] = fmt.Sprintf("Campo '%s' falhou na validação '%s'", fe.Field(), fe.Tag())
			}
			c.JSON(http.StatusBadRequest, gin.H{"errors": out})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if req.EndDate != nil && req.EndDate.Before(req.StartDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "EndDate deve ser posterior a StartDate"})
		return
	}

	_, err := db.Exec(
		"INSERT INTO diseases (name, start_date, end_date, profile_id) VALUES ($1, $2, $3, $4)",
		req.Name, req.StartDate, req.EndDate, req.ProfileID,
	)
	if err != nil {
		log.Printf("Erro ao adicionar doença: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao adicionar doença"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Doença adicionada com sucesso"})
}

// updateDisease atualiza uma doença por ID
func updateDisease(c *gin.Context) {
	id := c.Param("id")
	var req Disease
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]string, len(ve))
			for i, fe := range ve {
				out[i] = fmt.Sprintf("Campo '%s' falhou na validação '%s'", fe.Field(), fe.Tag())
			}
			c.JSON(http.StatusBadRequest, gin.H{"errors": out})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if req.EndDate != nil && req.EndDate.Before(req.StartDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "EndDate deve ser posterior a StartDate"})
		return
	}

	result, err := db.Exec(
		"UPDATE diseases SET name=$1, start_date=$2, end_date=$3, profile_id=$4 WHERE id=$5",
		req.Name, req.StartDate, req.EndDate, req.ProfileID, id,
	)
	if err != nil {
		log.Printf("Erro ao atualizar doença: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao atualizar doença"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar atualização"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doença não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Doença atualizada com sucesso"})
}

// deleteDisease deleta uma doença por ID
func deleteDisease(c *gin.Context) {
	id := c.Param("id")
	result, err := db.Exec("DELETE FROM diseases WHERE id=$1", id)
	if err != nil {
		log.Printf("Erro ao deletar doença: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao deletar doença"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar deleção"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doença não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Doença deletada com sucesso"})
}

// getMedications obtém todas as medicações para o profile_id
func getMedications(c *gin.Context) {
	profileID := c.Query("profile_id")
	if profileID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'profile_id' é obrigatório"})
		return
	}

	rows, err := db.Query("SELECT id, name, color, profile_id FROM medications WHERE profile_id = $1", profileID)
	if err != nil {
		log.Printf("Erro ao obter medicações: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter medicações"})
		return
	}
	defer rows.Close()

	var medications []Medication
	for rows.Next() {
		var m Medication
		if err := rows.Scan(&m.ID, &m.Name, &m.Color, &m.ProfileID); err != nil {
			log.Println("Erro ao escanear medicação:", err)
			continue
		}
		medications = append(medications, m)
	}

	if len(medications) == 0 {
		medications = []Medication{}
	}

	c.JSON(http.StatusOK, medications)
}

// addMedication adiciona uma nova medicação
func addMedication(c *gin.Context) {
	var req Medication
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]string, len(ve))
			for i, fe := range ve {
				out[i] = fmt.Sprintf("Campo '%s' falhou na validação '%s'", fe.Field(), fe.Tag())
			}
			c.JSON(http.StatusBadRequest, gin.H{"errors": out})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	_, err := db.Exec("INSERT INTO medications (name, color, profile_id) VALUES ($1, $2, $3)",
		req.Name, req.Color, req.ProfileID)
	if err != nil {
		log.Printf("Erro ao adicionar medicação: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao adicionar medicação"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Medicação adicionada com sucesso"})
}

// updateMedication atualiza uma medicação por ID
func updateMedication(c *gin.Context) {
	id := c.Param("id")
	var req Medication
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]string, len(ve))
			for i, fe := range ve {
				out[i] = fmt.Sprintf("Campo '%s' falhou na validação '%s'", fe.Field(), fe.Tag())
			}
			c.JSON(http.StatusBadRequest, gin.H{"errors": out})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	_, err := db.Exec("UPDATE medications SET name=$1, color=$2, profile_id=$3 WHERE id=$4",
		req.Name, req.Color, req.ProfileID, id)
	if err != nil {
		log.Printf("Erro ao atualizar medicação: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao atualizar medicação"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Medicação atualizada com sucesso"})
}

// deleteMedication deleta uma medicação por ID
func deleteMedication(c *gin.Context) {
	id := c.Param("id")
	result, err := db.Exec("DELETE FROM medications WHERE id=$1", id)
	if err != nil {
		log.Printf("Erro ao deletar medicação: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao deletar medicação"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar deleção"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Medicação não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Medicação deletada com sucesso"})
}

// getFeverThresholds obtém todas as Fever Thresholds para um profile_id
func getFeverThresholds(c *gin.Context) {
	profileID := c.Query("profile_id")
	if profileID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'profile_id' é obrigatório"})
		return
	}

	rows, err := db.Query("SELECT id, label, min_temp, max_temp, color, profile_id FROM fever_thresholds WHERE profile_id=$1 ORDER BY min_temp ASC", profileID)
	if err != nil {
		log.Printf("Erro ao obter Fever Thresholds: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter Fever Thresholds"})
		return
	}
	defer rows.Close()

	var thresholds []FeverThreshold
	for rows.Next() {
		var ft FeverThreshold
		if err := rows.Scan(&ft.ID, &ft.Label, &ft.MinTemp, &ft.MaxTemp, &ft.Color, &ft.ProfileID); err != nil {
			log.Println("Erro ao escanear Fever Threshold:", err)
			continue
		}
		thresholds = append(thresholds, ft)
	}

	if len(thresholds) == 0 {
		thresholds = []FeverThreshold{}
	}

	c.JSON(http.StatusOK, thresholds)
}

// addFeverThreshold adiciona uma nova Fever Threshold
func addFeverThreshold(c *gin.Context) {
	var req FeverThreshold
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]string, len(ve))
			for i, fe := range ve {
				out[i] = fmt.Sprintf("Campo '%s' falhou na validação '%s'", fe.Field(), fe.Tag())
			}
			c.JSON(http.StatusBadRequest, gin.H{"errors": out})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if req.MinTemp >= req.MaxTemp {
		c.JSON(http.StatusBadRequest, gin.H{"error": "MinTemp deve ser menor que MaxTemp"})
		return
	}

	_, err := db.Exec("INSERT INTO fever_thresholds (label, min_temp, max_temp, color, profile_id) VALUES ($1, $2, $3, $4, $5)",
		req.Label, req.MinTemp, req.MaxTemp, req.Color, req.ProfileID)
	if err != nil {
		log.Printf("Erro ao adicionar Fever Threshold: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao adicionar Fever Threshold"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Fever Threshold adicionada com sucesso"})
}

// updateFeverThreshold atualiza uma Fever Threshold por ID
func updateFeverThreshold(c *gin.Context) {
	id := c.Param("id")
	var req FeverThreshold
	if err := c.ShouldBindJSON(&req); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make([]string, len(ve))
			for i, fe := range ve {
				out[i] = fmt.Sprintf("Campo '%s' falhou na validação '%s'", fe.Field(), fe.Tag())
			}
			c.JSON(http.StatusBadRequest, gin.H{"errors": out})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if req.MinTemp >= req.MaxTemp {
		c.JSON(http.StatusBadRequest, gin.H{"error": "MinTemp deve ser menor que MaxTemp"})
		return
	}

	result, err := db.Exec(
		"UPDATE fever_thresholds SET label=$1, min_temp=$2, max_temp=$3, color=$4, profile_id=$5 WHERE id=$6",
		req.Label, req.MinTemp, req.MaxTemp, req.Color, req.ProfileID, id,
	)
	if err != nil {
		log.Printf("Erro ao atualizar Fever Threshold: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao atualizar Fever Threshold"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar atualização"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Fever Threshold não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Fever Threshold atualizada com sucesso"})
}

// deleteFeverThreshold deleta uma Fever Threshold por ID
func deleteFeverThreshold(c *gin.Context) {
	id := c.Param("id")
	result, err := db.Exec("DELETE FROM fever_thresholds WHERE id=$1", id)
	if err != nil {
		log.Printf("Erro ao deletar Fever Threshold: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao deletar Fever Threshold"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar deleção"})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Fever Threshold não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Fever Threshold deletada com sucesso"})
}

// generateReportPDF gera um relatório em PDF com o gráfico
func generateReportPDF(c *gin.Context) {
	start := c.Query("start")
	end := c.Query("end")
	profileID := c.Query("profile_id")

	if profileID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parâmetro 'profile_id' é obrigatório"})
		return
	}

	query := `
		SELECT f.id, f.profile_id, f.temperature, f.medication, f.date_time, null as disease_id, null as disease_name
		  FROM fever_medication_records f
		 WHERE f.profile_id = $1
	`
	args := []interface{}{profileID}

	if start != "" {
		query += " AND f.date_time >= $2"
		args = append(args, start)
	}
	if end != "" {
		if start == "" {
			// Precisamos de $2?
			query += " AND f.date_time <= $2"
		} else {
			query += " AND f.date_time <= $3"
		}
		args = append(args, end)
	}

	query += " ORDER BY f.date_time ASC"

	rows, err := db.Query(query, args...)
	if err != nil {
		log.Printf("Erro ao gerar relatório: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar relatório"})
		return
	}
	defer rows.Close()

	var records []FeverMedicationRecordWithDisease
	for rows.Next() {
		var r FeverMedicationRecordWithDisease
		if err := rows.Scan(&r.ID, &r.ProfileID, &r.Temperature, &r.Medication, &r.DateTime, &r.DiseaseID, &r.DiseaseName); err != nil {
			log.Println("Erro ao escanear registro:", err)
			continue
		}
		records = append(records, r)
	}

	// Obter medicações com cores
	medications, err := getAllMedications(profileID)
	if err != nil {
		log.Printf("Erro ao obter medicações: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter medicações"})
		return
	}

	// Obter Fever Thresholds
	thresholds, err := getAllFeverThresholds(profileID)
	if err != nil {
		log.Printf("Erro ao obter Fever Thresholds: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter Fever Thresholds"})
		return
	}

	// Map medicações para cores
	medColorMap := make(map[string]string)
	for _, med := range medications {
		medColorMap[med.Name] = med.Color
	}

	// Preparar dados para o gráfico
	var dates []time.Time
	var tempsData []float64
	var medicationsForChart []struct {
		Date       time.Time
		Medication string
		Color      string
	}
	for _, r := range records {
		dates = append(dates, r.DateTime)
		tempsData = append(tempsData, r.Temperature)
		if r.Medication != "" {
			color, exists := medColorMap[r.Medication]
			if exists {
				medicationsForChart = append(medicationsForChart, struct {
					Date       time.Time
					Medication string
					Color      string
				}{
					Date:       r.DateTime,
					Medication: r.Medication,
					Color:      color,
				})
			}
		}
	}

	// Gerar gráfico
	graphBuffer, err := generateChart(dates, tempsData, medicationsForChart, thresholds)
	if err != nil {
		log.Printf("Erro ao gerar gráfico: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar gráfico"})
		return
	}

	// Gerar PDF usando gofpdf
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetTitle("Relatório de Febre e Medicação", false)
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Relatório de Febre e Medicação")
	pdf.Ln(12)

	pdf.SetFont("Arial", "", 10)
	// Salvar o gráfico no servidor temporariamente
	chartPath := "chart.png"
	err = os.WriteFile(chartPath, graphBuffer, 0644)
	if err != nil {
		log.Printf("Erro ao salvar gráfico: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar gráfico"})
		return
	}
	defer os.Remove(chartPath) // Remover após a geração do PDF

	// Incluir o gráfico no PDF
	pdf.ImageOptions(chartPath, 10, 20, 190, 100, false, gofpdf.ImageOptions{ImageType: "PNG"}, 0, "")
	pdf.Ln(110)

	// Adicionar registros
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(40, 10, "Registros:", "", 1, "L", false, 0, "")

	pdf.SetFont("Arial", "", 10)
	for _, r := range records {
		line := fmt.Sprintf("ID: %d | Perfil: %d | Temp: %.1f°C | Med: %s | Data: %s",
			r.ID, r.ProfileID, r.Temperature, r.Medication, r.DateTime.Format("2006-01-02 15:04"))
		if r.DiseaseName != nil {
			line += fmt.Sprintf(" | Doença: %s", *r.DiseaseName)
		}
		pdf.MultiCell(0, 6, line, "", "L", false)
	}

	// Enviar PDF como resposta
	c.Header("Content-Type", "application/pdf")
	err = pdf.Output(c.Writer)
	if err != nil {
		log.Printf("Erro ao gerar PDF: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar PDF"})
		return
	}
}

// getAllMedications obtém todas as medicações para um profile_id (Função Auxiliar)
func getAllMedications(profileID string) ([]Medication, error) {
	rows, err := db.Query("SELECT id, name, color, profile_id FROM medications WHERE profile_id = $1", profileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var medications []Medication
	for rows.Next() {
		var m Medication
		if err := rows.Scan(&m.ID, &m.Name, &m.Color, &m.ProfileID); err != nil {
			log.Println("Erro ao escanear medicação:", err)
			continue
		}
		medications = append(medications, m)
	}

	return medications, nil
}

// getAllFeverThresholds obtém todas as Fever Thresholds para um profile_id (Função Auxiliar)
func getAllFeverThresholds(profileID string) ([]FeverThreshold, error) {
	rows, err := db.Query("SELECT id, label, min_temp, max_temp, color, profile_id FROM fever_thresholds WHERE profile_id=$1 ORDER BY min_temp ASC", profileID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var thresholds []FeverThreshold
	for rows.Next() {
		var ft FeverThreshold
		if err := rows.Scan(&ft.ID, &ft.Label, &ft.MinTemp, &ft.MaxTemp, &ft.Color, &ft.ProfileID); err != nil {
			log.Println("Erro ao escanear Fever Threshold:", err)
			continue
		}
		thresholds = append(thresholds, ft)
	}

	return thresholds, nil
}
