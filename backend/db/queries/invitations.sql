-- name: CreateInvitation :one
INSERT INTO invitations (
    owner_id,
    couple_names,
    slug,
    content,
    created_at,
    updated_at
) VALUES (
    $1,
    $2,
    $3,
    COALESCE($4::jsonb, '{}'::jsonb),
    now(),
    now()
)
RETURNING id, owner_id, couple_names, slug, content, published_at, created_at, updated_at;

-- name: UpdateInvitation :one
UPDATE invitations
SET
    content = COALESCE($3::jsonb, content),
    published_at = CASE
        WHEN $4::boolean IS TRUE THEN COALESCE(published_at, $5::timestamptz)
        WHEN $4::boolean IS FALSE THEN NULL
        ELSE published_at
    END,
    updated_at = now()
WHERE id = $1
  AND owner_id = $2
RETURNING id, owner_id, couple_names, slug, content, published_at, created_at, updated_at;

-- name: GetInvitationBySlug :one
SELECT id, owner_id, couple_names, slug, content, published_at, created_at, updated_at
FROM invitations
WHERE slug = $1;

-- name: DeleteInvitation :execrows
DELETE FROM invitations
WHERE id = $1
  AND owner_id = $2;
