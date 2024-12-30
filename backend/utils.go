package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

var (
	jwtSecret []byte
	db        *sql.DB
)

func initializeGlobals(secret []byte, dbConn *sql.DB) {
	jwtSecret = secret
	db = dbConn
	// validate = validator.New()
	// validate.RegisterValidation("hexcolor", validateHexColor)

	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterValidation("hexcolor", validateHexColor)
	} else {
		log.Fatal("Falha ao registrar a validação personalizada 'hexcolor'")
	}
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}

func validateHexColor(fl validator.FieldLevel) bool {
	s := fl.Field().String()
	if len(s) > 0 && s[0] == '#' {
		s = s[1:] // Remove o prefixo '#'
	}
	if len(s) != 6 {
		return false
	}
	for _, c := range s {
		if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
			return false
		}
	}
	return true
}

func jwtAuthMiddleware(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header não fornecido"})
		c.Abort()
		return
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
		c.Abort()
		return
	}

	tokenStr := parts[1]
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Método de assinatura inesperado: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		c.Abort()
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		c.Abort()
		return
	}

	userID, ok := claims["sub"].(float64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido: campo 'sub' ausente ou inválido"})
		c.Abort()
		return
	}
	c.Set("userID", int(userID))
	c.Next()
}

// createTables cria as tabelas necessárias no banco de dados se não existirem
func createTables() {
	// Define os comandos SQL para criar as tabelas
	tableQueries := []string{
		`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );`,
		`CREATE TABLE IF NOT EXISTS profiles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        );`,
		`CREATE TABLE IF NOT EXISTS diseases (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            start_date TIMESTAMP NOT NULL,
            end_date TIMESTAMP
        );`,
		`CREATE TABLE IF NOT EXISTS medications (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            color VARCHAR(6) NOT NULL
        );`,
		`CREATE TABLE IF NOT EXISTS fever_thresholds (
            id SERIAL PRIMARY KEY,
            label VARCHAR(50) NOT NULL,
            min_temp FLOAT NOT NULL,
            max_temp FLOAT NOT NULL,
            color VARCHAR(6) NOT NULL,
            CHECK (min_temp < max_temp)
        );`,
		`CREATE TABLE IF NOT EXISTS fever_medication_records (
            id SERIAL PRIMARY KEY,
            profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
            temperature FLOAT,
            medication VARCHAR(100),
            date_time TIMESTAMP NOT NULL
            -- Removida a coluna disease_id
        );`,
	}

	for _, query := range tableQueries {
		_, err := db.Exec(query)
		if err != nil {
			log.Fatalf("Erro ao criar tabela: %v", err)
		}
	}

	log.Println("Tabelas criadas ou já existentes.")

	// Remover a coluna disease_id se existir
	alterQuery := `ALTER TABLE fever_medication_records DROP COLUMN IF EXISTS disease_id;`
	_, err := db.Exec(alterQuery)
	if err != nil {
		log.Fatalf("Erro ao remover coluna disease_id: %v", err)
	}

	log.Println("Coluna disease_id removida da tabela fever_medication_records (se existia).")

	// Chama a função para criar o usuário admin se não existir
	createDefaultAdminUser()
}

// createDefaultAdminUser cria um usuário admin padrão se não existir
func createDefaultAdminUser() {
	// Verifica se o usuário admin já existe
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username=$1)", "admin").Scan(&exists)
	if err != nil {
		log.Fatalf("Erro ao verificar existência do usuário admin: %v", err)
	}

	if !exists {
		// Hash da senha
		hashedPassword, err := hashPassword("123456")
		if err != nil {
			log.Fatalf("Erro ao hashear a senha do admin: %v", err)
		}

		// Inserir o usuário admin
		_, err = db.Exec("INSERT INTO users (username, password) VALUES ($1, $2)", "admin", hashedPassword)
		if err != nil {
			log.Fatalf("Erro ao criar usuário admin: %v", err)
		}

		log.Println("Usuário admin criado com sucesso.")
	} else {
		log.Println("Usuário admin já existe.")
	}
}

// GetTodayDate retorna a data atual no formato "YYYY-MM-DD".
func GetTodayDate() string {
	today := time.Now()
	year, month, day := today.Date()
	return fmt.Sprintf("%04d-%02d-%02d", year, int(month), day)
}

// GetYesterdayDate retorna a data de ontem no formato "YYYY-MM-DD".
func GetYesterdayDate() string {
	yesterday := time.Now().AddDate(0, 0, -1)
	year, month, day := yesterday.Date()
	return fmt.Sprintf("%04d-%02d-%02d", year, int(month), day)
}

// GetThirtyDaysAgoDate retorna a data de 30 dias atrás no formato "YYYY-MM-DD".
func GetThirtyDaysAgoDate() string {
	pastDate := time.Now().AddDate(0, 0, -30)
	year, month, day := pastDate.Date()
	return fmt.Sprintf("%04d-%02d-%02d", year, int(month), day)
}

// FormatDate formata uma data para "YYYY-MM-DD".
func FormatDate(date time.Time) string {
	year, month, day := date.Date()
	return fmt.Sprintf("%04d-%02d-%02d", year, int(month), day)
}
