-- Curated music catalog seed for the invitation studio.
--
-- Idempotent: deterministic UUIDs (md5 of 'music:' || slug) with
-- ON CONFLICT (id) DO UPDATE, so re-running refreshes rows in place.
--
-- Files must exist in R2 first — upload with:
--   cd invitation && ./scripts/upload-music.sh <dir-of-mp3s>
-- and paste the printed src URLs below (keys are content-hashed, so a
-- replaced track gets a NEW url; update the row here when re-uploading).
--
--   docker exec -i rimba-digital-db psql -U rimba -d rimba_db < digital/db/seed/seed_music_tracks.sql
--
-- Classical tracks: Classicals.de recordings (free/CC, donation-based;
-- see classicals.de/music-licenses before heavy commercial marketing),
-- re-encoded to 128kbps, uploaded 2026-07-11.

\set ON_ERROR_STOP on

-- One transaction: a failed upsert must roll back the deletes below, never
-- leave the catalog partially emptied.
BEGIN;

-- Drop obsolete placeholder rows from earlier seed versions (dead URLs).
-- Scoped to the catalog prefix + placeholder hash: user uploads live under
-- invitations/<userId>/<uuid> and can never match this pattern.
DELETE FROM public.music_tracks
WHERE src LIKE 'https://assets-invitations.rimba.io/music/catalog/%-00000000.mp3';

-- Drop retired synthesized demo pads (replaced by the real catalog below;
-- the two gamelan demos stay until real traditional tracks are sourced).
DELETE FROM public.music_tracks WHERE id IN (
    md5('music:golden-hour')::uuid,
    md5('music:first-dance')::uuid,
    md5('music:morning-light')::uuid
);

INSERT INTO public.music_tracks (id, title, artist, category, src, duration_seconds, sort, active)
VALUES
    -- romantic
    (md5('music:canon-in-d')::uuid,          'Canon in D',            'Johann Pachelbel',      'romantic',     'https://assets-invitations.rimba.io/music/catalog/canon-in-d-58e27737.mp3',          357, 10, true),
    (md5('music:ave-maria-music-box')::uuid, 'Ave Maria (Music Box)', 'Bach / Gounod',         'romantic',     'https://assets-invitations.rimba.io/music/catalog/ave-maria-music-box-b8644182.mp3', 192, 20, true),
    (md5('music:ave-maria')::uuid,           'Ave Maria',             'Franz Schubert',        'romantic',     'https://assets-invitations.rimba.io/music/catalog/ave-maria-1a212715.mp3',           128, 30, true),
    (md5('music:clair-de-lune')::uuid,       'Clair de Lune',         'Claude Debussy',        'romantic',     'https://assets-invitations.rimba.io/music/catalog/clair-de-lune-5a1d18c8.mp3',       271, 40, true),
    (md5('music:reverie')::uuid,             'Rêverie',               'Claude Debussy',        'romantic',     'https://assets-invitations.rimba.io/music/catalog/reverie-1429966a.mp3',             285, 50, true),
    (md5('music:nocturne-op9-no2')::uuid,    'Nocturne Op. 9 No. 2',  'Frédéric Chopin',       'romantic',     'https://assets-invitations.rimba.io/music/catalog/nocturne-op9-no2-1147465c.mp3',    234, 60, true),
    (md5('music:wedding-march')::uuid,       'Wedding March',         'Felix Mendelssohn',     'romantic',     'https://assets-invitations.rimba.io/music/catalog/wedding-march-c4c2a31c.mp3',       302, 70, true),
    -- instrumental
    (md5('music:gymnopedie-no1')::uuid,      'Gymnopédie No. 1',      'Erik Satie',            'instrumental', 'https://assets-invitations.rimba.io/music/catalog/gymnopedie-no1-16cbbf4e.mp3',      225, 10, true),
    (md5('music:air-on-the-g-string')::uuid, 'Air on the G String',   'Johann Sebastian Bach', 'instrumental', 'https://assets-invitations.rimba.io/music/catalog/air-on-the-g-string-c483a818.mp3', 160, 20, true),
    (md5('music:canon-in-d-piano')::uuid,    'Canon in D (Piano)',    'Johann Pachelbel',      'instrumental', 'https://assets-invitations.rimba.io/music/catalog/canon-in-d-piano-3cc37d5b.mp3',    251, 30, true),
    (md5('music:fur-elise')::uuid,           'Für Elise',             'Ludwig van Beethoven',  'instrumental', 'https://assets-invitations.rimba.io/music/catalog/fur-elise-eb8066db.mp3',           169, 40, true),
    (md5('music:lullaby-music-box')::uuid,   'Lullaby (Music Box)',   'Johannes Brahms',       'instrumental', 'https://assets-invitations.rimba.io/music/catalog/lullaby-music-box-a1aba5ff.mp3',    71, 50, true),
    -- traditional (synthesized demos — replace when real gamelan tracks are licensed)
    (md5('music:gamelan-dawn')::uuid,        'Gamelan Dawn (demo)',   'Rimba Studio',          'traditional',  'https://assets-invitations.rimba.io/music/catalog/gamelan-dawn-dd2ce5a2.mp3',         32, 10, true),
    (md5('music:island-evening')::uuid,      'Island Evening (demo)', 'Rimba Studio',          'traditional',  'https://assets-invitations.rimba.io/music/catalog/island-evening-8a755cf9.mp3',       32, 20, true)
ON CONFLICT (id) DO UPDATE SET
    title            = EXCLUDED.title,
    artist           = EXCLUDED.artist,
    category         = EXCLUDED.category,
    src              = EXCLUDED.src,
    duration_seconds = EXCLUDED.duration_seconds,
    sort             = EXCLUDED.sort,
    active           = EXCLUDED.active;

COMMIT;
