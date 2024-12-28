# backend/Dockerfile
# Etapa de build do binário Go
FROM golang:1.22 as build

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . ./
RUN go build -o /go/bin/backend .

# Etapa final: imagem mínima
FROM debian:stable-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build /go/bin/backend /usr/local/bin/backend

EXPOSE 8080
ENTRYPOINT ["backend"]
