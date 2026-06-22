-- +goose Up
CREATE TABLE IF NOT EXISTS checkin_events (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id  UUID        NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
    event_code  TEXT        NOT NULL UNIQUE,
    pin_hash    TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkin_events_event_code ON checkin_events(event_code);

-- +goose StatementBegin
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'checkin_events_wedding_id_key'
    AND conrelid = 'checkin_events'::regclass
  ) THEN
    ALTER TABLE checkin_events ADD CONSTRAINT checkin_events_wedding_id_key UNIQUE (wedding_id);
  END IF;
END $$;
-- +goose StatementEnd

-- +goose Down
DROP TABLE IF EXISTS checkin_events;
