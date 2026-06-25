# syntax=docker/dockerfile:1
#
# Build context is the REPO ROOT (see docker-compose.yml), so this image can
# bundle the Go API, the catalog seeder, the goose migration CLI, and the
# repo-root db/migrations + db/seed. The entrypoint migrates + seeds, then
# starts the API — so `docker compose up` brings the whole stack up clean.

FROM golang:1.25-alpine AS builder
WORKDIR /src
RUN apk add --no-cache git

# Dependencies first (cached layer).
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# goose migration CLI (independent module).
RUN GOBIN=/out go install github.com/pressly/goose/v3/cmd/goose@latest

# Build the API + seeders as static binaries.
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/api ./cmd/api \
 && CGO_ENABLED=0 GOOS=linux go build -o /out/seed-catalog ./cmd/seed-catalog \
 && CGO_ENABLED=0 GOOS=linux go build -o /out/seed-pricing ./cmd/seed-pricing

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /app

COPY --from=builder /out/api /app/api
COPY --from=builder /out/seed-catalog /app/seed-catalog
COPY --from=builder /out/seed-pricing /app/seed-pricing
COPY --from=builder /out/goose /app/goose
COPY db/migrations /app/migrations
COPY db/seed /app/seed
COPY backend/docker-entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENV CATALOG_SEED_PATH=/app/seed/catalog-seed.json
ENV PRICING_SEED_PATH=/app/seed/pricing-seed.json
EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
