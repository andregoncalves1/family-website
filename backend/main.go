package main

import (
	"database/sql"
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq" // Driver para PostgreSQL
)

func main() {
	// Configuração da Base de Dados
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "password")
	dbName := getEnv("DB_NAME", "family_db")

	// String de conexão
	connStr := "host=" + dbHost + " port=" + dbPort + " user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"
	dbConn, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Erro ao conectar à base de dados: %v", err)
	}

	// Testar a conexão
	if err := dbConn.Ping(); err != nil {
		log.Fatalf("Erro ao verificar conexão à base de dados: %v", err)
	}

	// Inicializar variáveis globais
	jwtSecret := []byte(getEnv("JWT_SECRET", "default_secret"))
	initializeGlobals(jwtSecret, dbConn)

	// Criar tabelas (se necessário)
	createTables()

	// Configurar router
	router := gin.Default()

	// Rotas Públicas
	router.POST("/api/login", loginHandler)
	router.POST("/api/users", createUser)

	// Rotas Protegidas
	authorized := router.Group("/api")
	authorized.Use(jwtAuthMiddleware)
	{
		// Perfis
		authorized.GET("/profiles", getProfiles)
		authorized.POST("/profiles", createProfile)
		authorized.GET("/profiles/:id", getProfileByID)
		authorized.PUT("/profiles/:id", updateProfile)
		authorized.DELETE("/profiles/:id", deleteProfile)

		// Doenças
		authorized.GET("/diseases", getDiseases)
		authorized.POST("/diseases", addDisease)
		authorized.PUT("/diseases/:id", updateDisease)
		authorized.DELETE("/diseases/:id", deleteDisease)

		// Medicações
		authorized.GET("/medications", getMedications)
		authorized.POST("/medications", addMedication)
		authorized.PUT("/medications/:id", updateMedication)
		authorized.DELETE("/medications/:id", deleteMedication)

		// Fever Thresholds
		authorized.GET("/feverthresholds", getFeverThresholds)
		authorized.POST("/feverthresholds", addFeverThreshold)
		authorized.PUT("/feverthresholds/:id", updateFeverThreshold)
		authorized.DELETE("/feverthresholds/:id", deleteFeverThreshold)

		// Registros de Febre e Medicação
		authorized.GET("/fevermedications", getFeverMedication)
		authorized.POST("/fevermedications", addFeverMedication)

		// Relatórios
		authorized.GET("/reports/pdf", generateReportPDF)
	}

	// Iniciar o servidor
	port := getEnv("PORT", "18080")
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}
