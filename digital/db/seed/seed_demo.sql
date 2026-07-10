-- Demo seed for the digital app: guests, RSVPs, budget, checklist, invitation.
--
-- Idempotent: every row uses a deterministic UUID (md5 of a stable key) with
-- ON CONFLICT (id) DO UPDATE, so re-running refreshes the same rows instead of
-- creating duplicates and never touches non-seed rows.
--
-- Targets the only wedding in the DB. With more than one wedding you must
-- name the target explicitly — never guess across users:
--
--   docker exec -i database psql -U rimba -d rimba_db < digital/db/seed/seed_demo.sql
--   docker exec -i database psql -U rimba -d rimba_db -v wedding_id=<uuid> < digital/db/seed/seed_demo.sql

\set ON_ERROR_STOP on

\if :{?wedding_id}
SELECT set_config('seed.wedding_id', :'wedding_id', false);
\endif

DO $$
DECLARE
    w_id uuid;
BEGIN
    w_id := nullif(current_setting('seed.wedding_id', true), '')::uuid;
    IF w_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.weddings WHERE id = w_id) THEN
        RAISE EXCEPTION 'No wedding with id %.', w_id;
    END IF;
    IF w_id IS NULL THEN
        IF (SELECT count(*) FROM public.weddings) > 1 THEN
            RAISE EXCEPTION 'Multiple weddings found — pass the target: psql -v wedding_id=<uuid>';
        END IF;
        SELECT id INTO w_id FROM public.weddings LIMIT 1;
    END IF;
    IF w_id IS NULL THEN
        RAISE EXCEPTION 'No wedding found. Sign in and complete onboarding to create one first.';
    END IF;
    RAISE NOTICE 'Seeding demo data into wedding %', w_id;

    -- Fill in only the empty wedding fields (keep anything onboarding set).
    UPDATE public.weddings SET
        event_date     = COALESCE(event_date, DATE '2026-11-22'),
        venue_name     = COALESCE(venue_name, 'Grand Ballroom, Hotel Mulia'),
        venue_address  = COALESCE(venue_address, 'Jl. Asia Afrika No.8, Senayan, Jakarta'),
        host_name      = COALESCE(host_name, 'Keluarga Pratama & Keluarga Wijaya'),
        story          = COALESCE(story, 'We met in a Bandung coffee shop in 2019 and have been inseparable since.'),
        vibe           = COALESCE(vibe, 'elegant'),
        guest_estimate = COALESCE(guest_estimate, '150-200'),
        updated_at     = now()
    WHERE id = w_id;

    -- ── Owner membership ──────────────────────────────────────────────────────
    -- The guests/dashboard handlers resolve the active wedding via wedding_members
    -- (not owner_user_id), so the owner must be a member or those pages show empty.
    INSERT INTO public.wedding_members (wedding_id, user_id, role)
    SELECT w_id, owner_user_id, 'owner' FROM public.weddings WHERE id = w_id
    ON CONFLICT (wedding_id, user_id) DO UPDATE SET role = EXCLUDED.role, updated_at = now();

    -- ── Guests ──────────────────────────────────────────────────────────────
    INSERT INTO public.guests (id, wedding_id, name, email, phone, guest_group, party_size, notes)
    SELECT md5('seed-guest-' || w_id || '-' || g.n)::uuid, w_id,
           g.name, g.email, g.phone, g.grp, g.party, 'demo'
    FROM (VALUES
        (1,  'Andi & Sari Pratama', 'andi.pratama@example.com', '+62811000001', 'Family — Bride', 2),
        (2,  'Budi Santoso',        'budi.santoso@example.com', '+62811000002', 'Family — Bride', 1),
        (3,  'Citra Dewi',          'citra.dewi@example.com',   '+62811000003', 'Family — Groom', 2),
        (4,  'Dewi Lestari',        'dewi.lestari@example.com', '+62811000004', 'Family — Groom', 1),
        (5,  'Eko Wijaya',          'eko.wijaya@example.com',   '+62811000005', 'Friends',        2),
        (6,  'Fitri Handayani',     'fitri.h@example.com',      '+62811000006', 'Friends',        1),
        (7,  'Gilang Ramadhan',     'gilang.r@example.com',     '+62811000007', 'Friends',        2),
        (8,  'Hana Putri',          'hana.putri@example.com',   '+62811000008', 'Work',           1),
        (9,  'Indra Kusuma',        'indra.k@example.com',      '+62811000009', 'Work',           2),
        (10, 'Joko Susilo',         'joko.susilo@example.com',  '+62811000010', 'Work',           1),
        (11, 'Kartika Sari',        'kartika.sari@example.com', '+62811000011', 'Friends',        2),
        (12, 'Lukman Hakim',        'lukman.hakim@example.com', '+62811000012', 'Family — Groom', 4)
    ) AS g(n, name, email, phone, grp, party)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone,
        guest_group = EXCLUDED.guest_group, party_size = EXCLUDED.party_size, updated_at = now();

    -- ── RSVPs (one per guest; attendee_count = party_size when confirmed) ─────
    INSERT INTO public.rsvp (id, guest_id, wedding_id, status, attendee_count, message, responded_at)
    SELECT md5('seed-rsvp-' || w_id || '-' || r.n)::uuid,
           md5('seed-guest-' || w_id || '-' || r.n)::uuid, w_id,
           r.status, r.cnt, r.msg,
           CASE WHEN r.status = 'pending' THEN NULL ELSE TIMESTAMPTZ '2026-06-10 09:00:00+07' END
    FROM (VALUES
        (1,  'confirmed', 2, 'Can''t wait to celebrate with you!'),
        (2,  'confirmed', 1, NULL),
        (3,  'pending',   0, NULL),
        (4,  'confirmed', 1, 'See you there.'),
        (5,  'declined',  0, 'So sorry, will be abroad.'),
        (6,  'confirmed', 1, NULL),
        (7,  'pending',   0, NULL),
        (8,  'confirmed', 1, 'Congratulations!'),
        (9,  'confirmed', 2, NULL),
        (10, 'pending',   0, NULL),
        (11, 'confirmed', 2, 'Wouldn''t miss it.'),
        (12, 'confirmed', 4, 'Bringing the whole family.')
    ) AS r(n, status, cnt, msg)
    ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status, attendee_count = EXCLUDED.attendee_count,
        message = EXCLUDED.message, responded_at = EXCLUDED.responded_at, updated_at = now();

    -- ── Budget items (IDR) ───────────────────────────────────────────────────
    -- `paid` is GENERATED (actual > 0 AND paid_amount >= actual) since 00010:
    -- write paid_amount and let the column derive.
    INSERT INTO public.budget_items (id, wedding_id, category, item_name, vendor, estimated_amount, actual_amount, paid_amount, due_date)
    SELECT md5('seed-budget-' || w_id || '-' || b.n)::uuid, w_id,
           b.category, b.item_name, b.vendor, b.est, b.act,
           CASE WHEN b.paid THEN b.act ELSE 0 END, b.due
    FROM (VALUES
        (1, 'Venue',        'Grand Ballroom booking',   'Hotel Mulia',            80000000, 80000000, true,  DATE '2026-08-01'),
        (2, 'Catering',     'Plated dinner, 200 pax',   'Dapur Solo',             60000000, 0,        false, DATE '2026-10-01'),
        (3, 'Photography',  'Full-day + album',         'Lensa Cinta',            25000000, 10000000, false, DATE '2026-09-15'),
        (4, 'Attire',       'Gown & suit',              'Bramanta Wijaya',        30000000, 30000000, true,  DATE '2026-07-20'),
        (5, 'Decor',        'Floral & stage',           'Mawar Decor',            40000000, 0,        false, DATE '2026-10-15'),
        (6, 'Music',        'Live band + MC',           'Harmoni Entertainment',  20000000, 5000000,  false, DATE '2026-10-20'),
        (7, 'Invitations',  'Digital + 100 printed',    'Kartu Kita',             8000000,  8000000,  true,  DATE '2026-08-30'),
        (8, 'Misc',         'Souvenirs, 200 pcs',       'Berkah Souvenir',        12000000, 0,        false, DATE '2026-10-25')
    ) AS b(n, category, item_name, vendor, est, act, paid, due)
    ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category, item_name = EXCLUDED.item_name, vendor = EXCLUDED.vendor,
        estimated_amount = EXCLUDED.estimated_amount, actual_amount = EXCLUDED.actual_amount,
        paid_amount = EXCLUDED.paid_amount, due_date = EXCLUDED.due_date, updated_at = now();

    -- ── Checklist items ──────────────────────────────────────────────────────
    INSERT INTO public.checklist_items (id, wedding_id, title, description, due_date, completed_at, sort_order)
    SELECT md5('seed-checklist-' || w_id || '-' || c.n)::uuid, w_id,
           c.title, c.descr, c.due,
           CASE WHEN c.done THEN TIMESTAMPTZ '2026-06-01 10:00:00+07' ELSE NULL END,
           c.n
    FROM (VALUES
        (1, 'Book venue',             'Confirm date and pay deposit',        DATE '2026-07-01', true),
        (2, 'Hire photographer',      'Compare 3 vendors and book',          DATE '2026-08-01', true),
        (3, 'Send save-the-dates',    'Digital invite to all guests',        DATE '2026-09-01', false),
        (4, 'Finalize guest list',    'Confirm headcount with both families', DATE '2026-09-15', false),
        (5, 'Menu tasting',           'Schedule session with caterer',       DATE '2026-09-20', false),
        (6, 'Order attire',           'Fittings for gown and suit',          DATE '2026-08-15', true),
        (7, 'Confirm RSVPs',          'Follow up with pending guests',       DATE '2026-10-30', false),
        (8, 'Final venue walkthrough','Review layout and run-of-show',       DATE '2026-11-15', false)
    ) AS c(n, title, descr, due, done)
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, due_date = EXCLUDED.due_date,
        completed_at = EXCLUDED.completed_at, sort_order = EXCLUDED.sort_order, updated_at = now();

    -- ── Invitation ───────────────────────────────────────────────────────────
    INSERT INTO public.invitation (id, wedding_id, title, template_key, public_url, published_at)
    SELECT md5('seed-invitation-' || w_id)::uuid, w_id,
           'Our Wedding Invitation', 'warm-narrative',
           'http://localhost:3000/i/' || (SELECT slug FROM public.weddings WHERE id = w_id),
           TIMESTAMPTZ '2026-06-15 12:00:00+07'
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, template_key = EXCLUDED.template_key,
        public_url = EXCLUDED.public_url, published_at = EXCLUDED.published_at, updated_at = now();
END $$;
