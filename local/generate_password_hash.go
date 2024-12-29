package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Substitua "minha_senha" pela senha que deseja hashear
	password := "drnarl"

	// Gerar o hash da senha
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		fmt.Println("Erro ao gerar hash:", err)
		return
	}

	// Exibir o hash
	fmt.Println("Hash gerado:", string(hash))
}
