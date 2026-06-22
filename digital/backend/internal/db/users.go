package db

import (
	"context"
)

// User mirrors the Prisma schema's User model.
type User struct {
	ID        string
	Email     string
	FirstName *string
	LastName  *string
	ImageURL  *string
}

// UpsertUser inserts or updates a user by ID.
func (p *Pool) UpsertUser(ctx context.Context, u User) error {
	_, err := p.Exec(ctx, `
		INSERT INTO users (id, email, first_name, last_name, image_url, updated_at)
		VALUES ($1, $2, $3, $4, $5, now())
		ON CONFLICT (id) DO UPDATE
		  SET email      = EXCLUDED.email,
		      first_name = EXCLUDED.first_name,
		      last_name  = EXCLUDED.last_name,
		      image_url  = EXCLUDED.image_url,
		      updated_at = now()
	`, u.ID, u.Email, u.FirstName, u.LastName, u.ImageURL)
	return err
}

// DeleteUser removes a user by ID.
func (p *Pool) DeleteUser(ctx context.Context, id string) error {
	_, err := p.Exec(ctx, `DELETE FROM users WHERE id = $1`, id)
	return err
}
