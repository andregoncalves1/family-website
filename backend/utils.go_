// utils.go
package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

// Variáveis Globais
var (
	jwtSecret []byte
	validate  *validator.Validate
	db        *sql.DB
)

// initializeGlobals inicializa as variáveis globais
func initializeGlobals(secret []byte, dbConn *sql.DB) {
	jwtSecret = secret
	db = dbConn
	validate = validator.New()
	// Registrar validação personalizada para hexcolor
	validate.RegisterValidation("hexcolor", validateHexColor)
}

// hashPassword gera um hash de uma senha
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// checkPasswordHash verifica se a senha corresponde ao hash
func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// getEnv obtém uma variável de ambiente ou retorna o valor padrão
func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}

// validateHexColor é uma função de validação personalizada para cores hexadecimais
func validateHexColor(fl validator.FieldLevel) bool {
	s := fl.Field().String()
	if len(s) != 6 {
		return false
	}
	for _, c := range s {
		if !((c >= '0' && c <= '9') ||
			(c >= 'a' && c <= 'f') ||
			(c >= 'A' && c <= 'F')) {
			return false
		}
	}
	return true
}

// jwtAuthMiddleware é um middleware para autenticação JWT
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
		// Verificar o método de assinatura
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

	// Opcional: Adicionar informações adicionais no contexto
	claims, ok := token.Claims.(jwt.MapClaims)
	if ok && token.Valid {
		c.Set("userID", int(claims["sub"].(float64)))
	}

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
            date_time TIMESTAMP NOT NULL,
            disease_id INTEGER REFERENCES diseases(id) ON DELETE SET NULL
        );`,
	}

	for _, query := range tableQueries {
		_, err := db.Exec(query)
		if err != nil {
			log.Fatalf("Erro ao criar tabela: %v", err)
		}
	}

	log.Println("Tabelas criadas ou já existentes.")
}
