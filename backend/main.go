// main.go
package main

import (
	"database/sql"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq" // Driver para PostgreSQL
)

func main() {
	// Configuração da Base de Dados
	dbHost := getEnv("DB_HOST", "127.0.0.1")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "admin")
	dbPassword := getEnv("DB_PASSWORD", "rnnsd.AcreRU33I,au")
	dbName := getEnv("DB_NAME", "famhealth")

	// String de conexão
	connStr := "host=" + dbHost + " port=" + dbPort + " user=" + dbUser +
		" password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"
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

	// Configuração do CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5000", "http://saude.local", "http://saude.local:5000", "http://192.168.31.165:5000"}, // URL do frontend
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

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
		authorized.PUT("/fevermedications/:id", updateFeverMedication)
		authorized.DELETE("/fevermedications/:id", deleteFeverMedication)

		// Relatórios
		authorized.GET("/reports/pdf", generateReportPDF)
	}

	// Iniciar o servidor
	port := getEnv("PORT", "18080")
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}
