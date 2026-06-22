# syntax=docker/dockerfile:1

# --- Builder stage ---
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Cache module downloads.
COPY go.mod go.sum ./
RUN go mod download

# Build the static linux binary.
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /api ./cmd/api

# --- Runtime stage ---
FROM alpine:3.20

# ca-certificates for outbound HTTPS (e.g. S3_API / Cloudflare R2).
RUN apk add --no-cache ca-certificates

COPY --from=builder /api /api

EXPOSE 8080

ENTRYPOINT ["/api"]
