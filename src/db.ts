import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool | null {
    if (!process.env.DATABASE_URL) return null;
    if (!pool) {
        const isLocal =
            process.env.DATABASE_URL?.includes("localhost") ||
            process.env.DATABASE_URL?.includes("127.0.0.1");
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: isLocal ? false : { rejectUnauthorized: false },
        });
        pool.on("error", (err) => {
            console.error("DB pool error:", err.message);
        });
    }
    return pool;
}

export async function initDb(): Promise<void> {
    const db = getPool();
    if (!db) {
        console.log("DATABASE_URL not set — skipping DB init");
        return;
    }
    await db.query(`
        CREATE TABLE IF NOT EXISTS spotify_snapshots (
            id          SERIAL PRIMARY KEY,
            captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            monthly_listeners INTEGER
        );

        CREATE TABLE IF NOT EXISTS spotify_tracks (
            id          SERIAL PRIMARY KEY,
            snapshot_id INTEGER NOT NULL REFERENCES spotify_snapshots(id) ON DELETE CASCADE,
            rank        INTEGER NOT NULL,
            track_id    TEXT NOT NULL,
            name        TEXT NOT NULL,
            album       TEXT NOT NULL,
            album_image TEXT,
            duration_ms INTEGER NOT NULL
        );
    `);
    console.log("DB tables ready");
}

export async function saveSnapshot(
    monthlyListeners: number | null,
    tracks: {
        id: string;
        name: string;
        album: string;
        albumImage: string | null;
        durationMs: number;
    }[]
): Promise<void> {
    const db = getPool();
    if (!db) return;

    const client = await db.connect();
    try {
        await client.query("BEGIN");
        const { rows } = await client.query<{ id: number }>(
            `INSERT INTO spotify_snapshots (monthly_listeners) VALUES ($1) RETURNING id`,
            [monthlyListeners]
        );
        const snapshotId = rows[0].id;

        for (let i = 0; i < tracks.length; i++) {
            const t = tracks[i];
            await client.query(
                `INSERT INTO spotify_tracks
                    (snapshot_id, rank, track_id, name, album, album_image, duration_ms)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [snapshotId, i + 1, t.id, t.name, t.album, t.albumImage, t.durationMs]
            );
        }
        await client.query("COMMIT");
        console.log(`Spotify snapshot #${snapshotId} saved`);
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}
