package handlers

import (
	"encoding/json"
	"net/http"
)

// rowScanner is the minimal interface satisfied by both pgx.Row and pgx.Rows,
// letting scan helpers work for single-row and multi-row queries alike.
type rowScanner interface {
	Scan(...any) error
}

// writeJSON writes value as a JSON response with the given status code.
func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
