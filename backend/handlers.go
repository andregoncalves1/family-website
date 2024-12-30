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

// FeverMedicationRecordWithDisease representa um registro com informações da doença
type FeverMedicationRecordWithDisease struct {
	ID          int       `json:"id"`
	ProfileID   int       `json:"profile_id"`
	Temperature float64   `json:"temperature"`
	Medication  string    `json:"medication"`
	DateTime    time.Time `json:"date_time"`
	DiseaseID   *int      `json:"disease_id"`
	DiseaseName *string   `json:"disease_name"`
}

// loginHandler trata o login do utilizador
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

	// Verificar senha com hash
	if !checkPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Senha incorreta"})
		return
	}

	// Gerar token
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

// createUser cria um novo utilizador
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

	// Hash da senha
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha"})
		return
	}

	// Inserir utilizador no banco de dados
	_, err = db.Exec("INSERT INTO users (username, password) VALUES ($1, $2)", req.Username, hashedPassword)
	if err != nil {
		log.Printf("Erro ao criar utilizador: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao criar utilizador"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Utilizador criado com sucesso"})
}

// getProfiles obtém todos os perfis
func getProfiles(c *gin.Context) {
	rows, err := db.Query("SELECT id, name FROM profiles")
	if err != nil {
		log.Printf("Erro ao obter perfis: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter perfis"})
		return
	}
	defer rows.Close()

	var profiles []Profile
	for rows.Next() {
		var p Profile
		if err := rows.Scan(&p.ID, &p.Name); err != nil {
			log.Println("Erro ao escanear perfil:", err)
			continue
		}
		profiles = append(profiles, p)
	}

	c.JSON(http.StatusOK, profiles)
}

// createProfile cria um novo perfil
func createProfile(c *gin.Context) {
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

	_, err := db.Exec("INSERT INTO profiles (name) VALUES ($1)", req.Name)
	if err != nil {
		log.Printf("Erro ao criar perfil: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao criar perfil"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Perfil criado com sucesso"})
}

// getProfileByID obtém um perfil por ID
func getProfileByID(c *gin.Context) {
	id := c.Param("id")
	var p Profile
	err := db.QueryRow("SELECT id, name FROM profiles WHERE id=$1", id).Scan(&p.ID, &p.Name)
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

// updateProfile atualiza um perfil por ID
func updateProfile(c *gin.Context) {
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

	result, err := db.Exec("UPDATE profiles SET name=$1 WHERE id=$2", req.Name, id)
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
		c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Perfil atualizado com sucesso"})
}

// deleteProfile deleta um perfil por ID
func deleteProfile(c *gin.Context) {
	id := c.Param("id")
	result, err := db.Exec("DELETE FROM profiles WHERE id=$1", id)
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
		c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Perfil deletado com sucesso"})
}

// getFeverMedication obtém registros de febre e medicação com filtros
func getFeverMedication(c *gin.Context) {
	start := c.Query("start")
	end := c.Query("end")
	diseaseID := c.Query("disease_id")

	query := `SELECT f.id, f.profile_id, f.temperature, f.medication, f.date_time, f.disease_id, d.name as disease_name
              FROM fever_medication_records f
              LEFT JOIN diseases d ON f.disease_id = d.id
              WHERE 1=1`
	args := []interface{}{}
	count := 1

	// Adiciona filtro de data de início, se fornecido
	if start != "" {
		query += fmt.Sprintf(" AND f.date_time >= $%d", count)
		args = append(args, start)
		count++
	}

	// Adiciona filtro de data de fim, se fornecido
	if end != "" {
		// Parse da data de fim
		parsedEnd, err := time.Parse("2006-01-02", end)
		if err != nil {
			log.Printf("Erro ao parsear end date: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido para 'end'"})
			return
		}
		// Define o horário como 23:59:59.999 para incluir todo o dia
		parsedEnd = parsedEnd.Add(23*time.Hour + 59*time.Minute + 59*time.Second + 999*time.Millisecond)
		// Formata a data para o formato esperado pelo banco de dados
		endFormatted := parsedEnd.Format("2006-01-02 15:04:05") // Ajuste conforme necessário
		query += fmt.Sprintf(" AND f.date_time <= $%d", count)
		args = append(args, endFormatted)
		count++
	}

	// Adiciona filtro de disease_id, se fornecido
	if diseaseID != "" {
		query += fmt.Sprintf(" AND f.disease_id = $%d", count)
		args = append(args, diseaseID)
		count++
	}

	query += ` ORDER BY f.date_time ASC`

	rows, err := db.Query(query, args...)
	if err != nil {
		log.Printf("Erro ao obter registros de febre e medicação: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter registros"})
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

	// Retornar uma lista vazia se não houver registros
	if len(records) == 0 {
		records = []FeverMedicationRecordWithDisease{}
	}

	c.JSON(http.StatusOK, records)
}

// addFeverMedication adiciona um novo registro de febre e medicação
func addFeverMedication(c *gin.Context) {
	var req FeverMedicationRecord
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

	// Validar se a medicação existe
	if req.Medication != "" {
		var medID int
		err := db.QueryRow("SELECT id FROM medications WHERE name=$1", req.Medication).Scan(&medID)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Medicação inválida"})
				return
			}
			log.Printf("Erro ao verificar medicação: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar medicação"})
			return
		}
	}

	// Validar se a disease_id existe, se fornecida
	if req.DiseaseID != nil {
		var diseaseExists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM diseases WHERE id=$1)", *req.DiseaseID).Scan(&diseaseExists)
		if err != nil {
			log.Printf("Erro ao verificar disease_id: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar doença"})
			return
		}
		if !diseaseExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Doença inválida"})
			return
		}
	}

	_, err := db.Exec(`
        INSERT INTO fever_medication_records (profile_id, temperature, medication, date_time, disease_id)
        VALUES ($1, $2, $3, $4, $5)
    `, req.ProfileID, req.Temperature, req.Medication, req.DateTime, req.DiseaseID)
	if err != nil {
		log.Printf("Erro ao adicionar registro: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao adicionar registro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registro adicionado com sucesso"})
}

// updateFeverMedication atualiza um registro existente de febre e medicação
func updateFeverMedication(c *gin.Context) {
	// Obter o ID do registro a partir dos parâmetros da URL
	idParam := c.Param("id")
	if idParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do registro é obrigatório"})
		return
	}

	// Converter o ID para inteiro
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do registro inválido"})
		return
	}

	// Bind dos dados recebidos para a estrutura de atualização
	var updateReq FeverMedicationUpdateRequest
	if err := c.ShouldBindJSON(&updateReq); err != nil {
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

	// Construir a consulta SQL dinâmica com base nos campos fornecidos
	query := "UPDATE fever_medication_records SET "
	args := []interface{}{}
	argCount := 1

	if updateReq.Temperature != nil {
		query += fmt.Sprintf("temperature = $%d, ", argCount)
		args = append(args, *updateReq.Temperature)
		argCount++
	}

	if updateReq.Medication != nil {
		// Verificar se a medicação existe
		var medID int
		err := db.QueryRow("SELECT id FROM medications WHERE name=$1", *updateReq.Medication).Scan(&medID)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Medicação inválida"})
				return
			}
			log.Printf("Erro ao verificar medicação: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar medicação"})
			return
		}
		query += fmt.Sprintf("medication = $%d, ", argCount)
		args = append(args, *updateReq.Medication)
		argCount++
	}

	if updateReq.DateTime != nil {
		query += fmt.Sprintf("date_time = $%d, ", argCount)
		args = append(args, *updateReq.DateTime)
		argCount++
	}

	if updateReq.DiseaseID != nil {
		// Verificar se a disease_id existe
		var diseaseExists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM diseases WHERE id=$1)", *updateReq.DiseaseID).Scan(&diseaseExists)
		if err != nil {
			log.Printf("Erro ao verificar disease_id: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar doença"})
			return
		}
		if !diseaseExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Doença inválida"})
			return
		}
		query += fmt.Sprintf("disease_id = $%d, ", argCount)
		args = append(args, *updateReq.DiseaseID)
		argCount++
	}

	// Remover a última vírgula e espaço
	if len(args) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar"})
		return
	}
	query = query[:len(query)-2]

	// Adicionar a cláusula WHERE
	query += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, id)

	// Executar a consulta
	result, err := db.Exec(query, args...)
	if err != nil {
		log.Printf("Erro ao atualizar registro: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar registro"})
		return
	}

	rowsAffected, err := result.RowsAffected()
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
	// Obter o ID do registro a partir dos parâmetros da URL
	idParam := c.Param("id")
	if idParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do registro é obrigatório"})
		return
	}

	// Converter o ID para inteiro
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do registro inválido"})
		return
	}

	// Executar a consulta de exclusão
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

// getDiseases obtém todas as doenças
func getDiseases(c *gin.Context) {
	rows, err := db.Query("SELECT id, name, start_date, end_date FROM diseases")
	if err != nil {
		log.Printf("Erro ao obter doenças: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter doenças"})
		return
	}
	defer rows.Close()

	var diseases []Disease
	for rows.Next() {
		var d Disease
		if err := rows.Scan(&d.ID, &d.Name, &d.StartDate, &d.EndDate); err != nil {
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

	_, err := db.Exec("INSERT INTO diseases (name, start_date, end_date) VALUES ($1, $2, $3)", req.Name, req.StartDate, req.EndDate)
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

	result, err := db.Exec("UPDATE diseases SET name=$1, start_date=$2, end_date=$3 WHERE id=$4", req.Name, req.StartDate, req.EndDate, id)
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

// getMedications obtém todas as medicações
func getMedications(c *gin.Context) {
	rows, err := db.Query("SELECT id, name, color FROM medications")
	if err != nil {
		log.Printf("Erro ao obter medicações: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter medicações"})
		return
	}
	defer rows.Close()

	var medications []Medication
	for rows.Next() {
		var m Medication
		if err := rows.Scan(&m.ID, &m.Name, &m.Color); err != nil {
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
				out[i] = fmt.Sprintf("Campo '%s' falhou na validação '%s' - %s", fe.Field(), fe.Tag(), req.Color)
			}
			c.JSON(http.StatusBadRequest, gin.H{"errors": out})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	_, err := db.Exec("INSERT INTO medications (name, color) VALUES ($1, $2)", req.Name, req.Color)
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

	_, err := db.Exec("UPDATE medications SET name=$1, color=$2 WHERE id=$3", req.Name, req.Color, id)
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

// getFeverThresholds obtém todas as Fever Thresholds
func getFeverThresholds(c *gin.Context) {
	rows, err := db.Query("SELECT id, label, min_temp, max_temp, color FROM fever_thresholds ORDER BY min_temp ASC")
	if err != nil {
		log.Printf("Erro ao obter Fever Thresholds: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter Fever Thresholds"})
		return
	}
	defer rows.Close()

	var thresholds []FeverThreshold
	for rows.Next() {
		var ft FeverThreshold
		if err := rows.Scan(&ft.ID, &ft.Label, &ft.MinTemp, &ft.MaxTemp, &ft.Color); err != nil {
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

	_, err := db.Exec("INSERT INTO fever_thresholds (label, min_temp, max_temp, color) VALUES ($1, $2, $3, $4)", req.Label, req.MinTemp, req.MaxTemp, req.Color)
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

	result, err := db.Exec("UPDATE fever_thresholds SET label=$1, min_temp=$2, max_temp=$3, color=$4 WHERE id=$5", req.Label, req.MinTemp, req.MaxTemp, req.Color, id)
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
	// Filtrar por doença ou intervalo de datas
	start := c.Query("start")
	end := c.Query("end")
	diseaseID := c.Query("disease_id")

	// Obter registros
	query := `SELECT f.id, f.profile_id, f.temperature, f.medication, f.date_time, f.disease_id, d.name as disease_name
              FROM fever_medication_records f
              LEFT JOIN diseases d ON f.disease_id = d.id
              WHERE 1=1`
	args := []interface{}{}
	count := 1

	if start != "" {
		query += fmt.Sprintf(" AND f.date_time >= $%d", count)
		args = append(args, start)
		count++
	}
	if end != "" {
		query += fmt.Sprintf(" AND f.date_time <= $%d", count)
		args = append(args, end)
		count++
	}
	if diseaseID != "" {
		query += fmt.Sprintf(" AND f.disease_id = $%d", count)
		args = append(args, diseaseID)
		count++
	}

	query += ` ORDER BY f.date_time ASC`

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
	medications, err := getAllMedications()
	if err != nil {
		log.Printf("Erro ao obter medicações: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter medicações"})
		return
	}

	// Obter Fever Thresholds
	thresholds, err := getAllFeverThresholds()
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

// getAllMedications obtém todas as medicações (Função Auxiliar)
func getAllMedications() ([]Medication, error) {
	rows, err := db.Query("SELECT id, name, color FROM medications")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var medications []Medication
	for rows.Next() {
		var m Medication
		if err := rows.Scan(&m.ID, &m.Name, &m.Color); err != nil {
			log.Println("Erro ao escanear medicação:", err)
			continue
		}
		medications = append(medications, m)
	}

	return medications, nil
}

// getAllFeverThresholds obtém todas as Fever Thresholds (Função Auxiliar)
func getAllFeverThresholds() ([]FeverThreshold, error) {
	rows, err := db.Query("SELECT id, label, min_temp, max_temp, color FROM fever_thresholds ORDER BY min_temp ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var thresholds []FeverThreshold
	for rows.Next() {
		var ft FeverThreshold
		if err := rows.Scan(&ft.ID, &ft.Label, &ft.MinTemp, &ft.MaxTemp, &ft.Color); err != nil {
			log.Println("Erro ao escanear Fever Threshold:", err)
			continue
		}
		thresholds = append(thresholds, ft)
	}

	return thresholds, nil
}
