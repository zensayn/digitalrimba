-- +goose Up
CREATE TABLE IF NOT EXISTS public."user" (
    "id" text PRIMARY KEY,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "emailVerified" boolean NOT NULL DEFAULT false,
    "image" text,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now()
);

-- +goose StatementBegin
DO $$
BEGIN
    IF to_regclass('public.users') IS NOT NULL
       AND to_regclass('public.clerk_users_backup') IS NULL THEN
        ALTER TABLE public.users RENAME TO clerk_users_backup;
    END IF;
END $$;
-- +goose StatementEnd

-- +goose StatementBegin
DO $$
BEGIN
    IF to_regclass('public.clerk_users_backup') IS NOT NULL THEN
        EXECUTE $SQL$
            INSERT INTO public."user" (
                "id",
                "name",
                "email",
                "emailVerified",
                "image",
                "createdAt",
                "updatedAt"
            )
            SELECT
                c.id,
                COALESCE(NULLIF(trim(concat_ws(' ', c.first_name, c.last_name)), ''), c.email),
                c.email,
                false,
                c.image_url,
                c.created_at,
                c.updated_at
            FROM public.clerk_users_backup c
            WHERE NOT EXISTS (
                SELECT 1 FROM public."user" u WHERE u.id = c.id OR lower(u.email) = lower(c.email)
            )
        $SQL$;

        EXECUTE $SQL$
            UPDATE public.weddings w
            SET owner_user_id = u.id
            FROM public.clerk_users_backup c
            JOIN public."user" u ON lower(u.email) = lower(c.email)
            WHERE w.owner_user_id = c.id
        $SQL$;

        IF to_regclass('public.invitations') IS NOT NULL THEN
            EXECUTE $SQL$
                UPDATE public.invitations i
                SET owner_id = u.id
                FROM public.clerk_users_backup c
                JOIN public."user" u ON lower(u.email) = lower(c.email)
                WHERE i.owner_id = c.id
            $SQL$;
        END IF;

        IF to_regclass('public.operators') IS NOT NULL THEN
            EXECUTE $SQL$
                UPDATE public.operators o
                SET user_id = u.id
                FROM public.clerk_users_backup c
                JOIN public."user" u ON lower(u.email) = lower(c.email)
                WHERE o.user_id = c.id
            $SQL$;
        END IF;

        IF to_regclass('public.checkin') IS NOT NULL THEN
            EXECUTE $SQL$
                UPDATE public.checkin ch
                SET checked_in_by = u.id
                FROM public.clerk_users_backup c
                JOIN public."user" u ON lower(u.email) = lower(c.email)
                WHERE ch.checked_in_by = c.id
            $SQL$;
        END IF;
    END IF;
END $$;
-- +goose StatementEnd

ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_owner_user_id_fkey;
ALTER TABLE public.weddings
    ADD CONSTRAINT weddings_owner_user_id_fkey
    FOREIGN KEY (owner_user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

-- +goose StatementBegin
DO $$
BEGIN
    IF to_regclass('public.invitations') IS NOT NULL THEN
        ALTER TABLE public.invitations DROP CONSTRAINT IF EXISTS invitations_owner_id_fkey;
        ALTER TABLE public.invitations
            ADD CONSTRAINT invitations_owner_id_fkey
            FOREIGN KEY (owner_id) REFERENCES public."user"(id) ON DELETE CASCADE;
    END IF;
END $$;
-- +goose StatementEnd

-- +goose StatementBegin
DO $$
BEGIN
    IF to_regclass('public.operators') IS NOT NULL THEN
        ALTER TABLE public.operators DROP CONSTRAINT IF EXISTS operators_user_id_fkey;
        ALTER TABLE public.operators
            ADD CONSTRAINT operators_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;
    END IF;
END $$;
-- +goose StatementEnd

-- +goose StatementBegin
DO $$
BEGIN
    IF to_regclass('public.checkin') IS NOT NULL THEN
        ALTER TABLE public.checkin DROP CONSTRAINT IF EXISTS checkin_checked_in_by_fkey;
        ALTER TABLE public.checkin
            ADD CONSTRAINT checkin_checked_in_by_fkey
            FOREIGN KEY (checked_in_by) REFERENCES public."user"(id) ON DELETE SET NULL;
    END IF;
END $$;
-- +goose StatementEnd

CREATE TABLE IF NOT EXISTS public.wedding_members (
    wedding_id uuid NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (wedding_id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS weddings_owner_user_id_unique
    ON public.weddings(owner_user_id);

-- +goose Down
DROP INDEX IF EXISTS public.weddings_owner_user_id_unique;
DROP TABLE IF EXISTS public.wedding_members;

-- +goose StatementBegin
DO $$
BEGIN
    IF to_regclass('public.clerk_users_backup') IS NOT NULL THEN
        ALTER TABLE public.weddings DROP CONSTRAINT IF EXISTS weddings_owner_user_id_fkey;

        IF to_regclass('public.invitations') IS NOT NULL THEN
            ALTER TABLE public.invitations DROP CONSTRAINT IF EXISTS invitations_owner_id_fkey;
        END IF;

        IF to_regclass('public.operators') IS NOT NULL THEN
            ALTER TABLE public.operators DROP CONSTRAINT IF EXISTS operators_user_id_fkey;
        END IF;

        IF to_regclass('public.checkin') IS NOT NULL THEN
            ALTER TABLE public.checkin DROP CONSTRAINT IF EXISTS checkin_checked_in_by_fkey;
        END IF;

        IF to_regclass('public."user"') IS NOT NULL THEN
            EXECUTE $SQL$
                UPDATE public.weddings w
                SET owner_user_id = c.id
                FROM public.clerk_users_backup c
                JOIN public."user" u ON lower(u.email) = lower(c.email)
                WHERE w.owner_user_id = u.id
            $SQL$;

            IF to_regclass('public.invitations') IS NOT NULL THEN
                EXECUTE $SQL$
                    UPDATE public.invitations i
                    SET owner_id = c.id
                    FROM public.clerk_users_backup c
                    JOIN public."user" u ON lower(u.email) = lower(c.email)
                    WHERE i.owner_id = u.id
                $SQL$;
            END IF;

            IF to_regclass('public.operators') IS NOT NULL THEN
                EXECUTE $SQL$
                    UPDATE public.operators o
                    SET user_id = c.id
                    FROM public.clerk_users_backup c
                    JOIN public."user" u ON lower(u.email) = lower(c.email)
                    WHERE o.user_id = u.id
                $SQL$;
            END IF;

            IF to_regclass('public.checkin') IS NOT NULL THEN
                EXECUTE $SQL$
                    UPDATE public.checkin ch
                    SET checked_in_by = c.id
                    FROM public.clerk_users_backup c
                    JOIN public."user" u ON lower(u.email) = lower(c.email)
                    WHERE ch.checked_in_by = u.id
                $SQL$;
            END IF;
        END IF;

        ALTER TABLE public.weddings
            ADD CONSTRAINT weddings_owner_user_id_fkey
            FOREIGN KEY (owner_user_id) REFERENCES public.clerk_users_backup(id) ON DELETE CASCADE;

        IF to_regclass('public.invitations') IS NOT NULL THEN
            ALTER TABLE public.invitations
                ADD CONSTRAINT invitations_owner_id_fkey
                FOREIGN KEY (owner_id) REFERENCES public.clerk_users_backup(id) ON DELETE CASCADE;
        END IF;

        IF to_regclass('public.operators') IS NOT NULL THEN
            ALTER TABLE public.operators
                ADD CONSTRAINT operators_user_id_fkey
                FOREIGN KEY (user_id) REFERENCES public.clerk_users_backup(id) ON DELETE CASCADE;
        END IF;

        IF to_regclass('public.checkin') IS NOT NULL THEN
            ALTER TABLE public.checkin
                ADD CONSTRAINT checkin_checked_in_by_fkey
                FOREIGN KEY (checked_in_by) REFERENCES public.clerk_users_backup(id) ON DELETE SET NULL;
        END IF;

        IF to_regclass('public.users') IS NULL THEN
            ALTER TABLE public.clerk_users_backup RENAME TO users;
        END IF;
    END IF;
END $$;
-- +goose StatementEnd

-- +goose StatementBegin
DO $$
BEGIN
    IF to_regclass('public."user"') IS NOT NULL
       AND NOT EXISTS (
           SELECT 1
           FROM pg_constraint
           WHERE contype = 'f'
             AND confrelid = to_regclass('public."user"')
       ) THEN
        DROP TABLE public."user";
    END IF;
END $$;
-- +goose StatementEnd
