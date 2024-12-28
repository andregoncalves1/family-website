// main.go
package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
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
	if err := router.Run(":18080"); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}
