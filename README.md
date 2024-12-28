# Meu Site de Gestão de Saúde Familiar

Este projeto contém:

- **Backend** em Go (Golang) com autenticação JWT, rotas para:
  - Login e criação/gestão de utilizadores
  - Gestão de perfis
  - Registo de febre e medicação
  - Registo de doenças
  - Relatórios (simulação de exportação)
- **Frontend** em Vue.js (com Vue Router) para exibir e gerir:
  - Página de Login
  - Dashboard com Cabeçalho e menus (Saúde, Gestão, ... )
  - Sub-separadores em Saúde (Febre e Medicação, Doenças, Relatórios)
  - Configuração de Perfis
- **Base de Dados** PostgreSQL gerida por Docker Compose
- **Scripts** de backup e restauração

## Pré-requisitos

- Docker e Docker Compose instalados na máquina de alojamento.
- Conta ou host (Azure VM, por exemplo) com portas 80 e 8080 abertas (ou conforme a configuração do `docker-compose.yml`).

## Como Executar

1. Clone o repositório:

   ```bash
   git clone https://github.com/andregoncalves1/family-website
   cd family-website
   docker-compose up -d --build