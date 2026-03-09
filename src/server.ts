import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import { initDb, saveSnapshot, getPool } from "./db.js";

// Load .env in dev (Node 20+ built-in)
try { process.loadEnvFile(".env"); } catch { /* already set via environment */ }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Spotify scraper ─────────────────────────────────────────────────────────

const ARTIST_ID = "3iEbz4zyLq1ac5GQKLR8jx";

async function getSpotifyToken(): Promise<string> {
    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${creds}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });
    const data = (await res.json()) as { access_token: string };
    return data.access_token;
}

// Spotify og:description returns abbreviated numbers e.g. "50.4K" or "1.2M"
function parseAbbreviatedNumber(s: string): number {
    const n = parseFloat(s.replace(/,/g, ""));
    if (s.endsWith("K")) return Math.round(n * 1_000);
    if (s.endsWith("M")) return Math.round(n * 1_000_000);
    if (s.endsWith("B")) return Math.round(n * 1_000_000_000);
    return Math.round(n);
}

async function getMonthlyListeners(artistId: string): Promise<number | null> {
    try {
        const res = await fetch(`https://open.spotify.com/artist/${artistId}`, {
            headers: { "User-Agent": "facebookexternalhit/1.1" },
        });
        const html = await res.text();
        // Matches "50.4K monthly listeners" or "1,234,567 monthly listeners"
        const match = html.match(
            /content="[^"]*?·\s*([\d.,]+[KMB]?)\s*monthly listeners/i
        );
        if (match) return parseAbbreviatedNumber(match[1]);
    } catch {
        // ignore
    }
    return null;
}

interface SpotifyData {
    name: string;
    image: string | null;
    monthlyListeners: number | null;
    topTracks: {
        id: string;
        name: string;
        album: string;
        albumImage: string | null;
        durationMs: number;
    }[];
}

async function fetchSpotifyData(): Promise<SpotifyData> {
    const token = await getSpotifyToken();
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch artist info, their albums, and monthly listeners in parallel
    const [artistRes, albumsRes, monthlyListeners] = await Promise.all([
        fetch(`https://api.spotify.com/v1/artists/${ARTIST_ID}`, { headers }),
        fetch(
            `https://api.spotify.com/v1/artists/${ARTIST_ID}/albums?include_groups=single,album&market=US&limit=10`,
            { headers }
        ),
        getMonthlyListeners(ARTIST_ID),
    ]);

    const artist = (await artistRes.json()) as {
        name: string;
        images: { url: string }[];
    };
    const albums = (await albumsRes.json()) as {
        items: { id: string; name: string; images: { url: string }[] }[];
    };

    // Fetch tracks for each album in parallel, take first track of each
    const albumTracks = await Promise.all(
        albums.items.map((album) =>
            fetch(
                `https://api.spotify.com/v1/albums/${album.id}/tracks?market=US&limit=1`,
                { headers }
            )
                .then((r) => r.json())
                .then(
                    (data: {
                        items: { id: string; name: string; duration_ms: number }[];
                    }) => ({
                        albumId: album.id,
                        albumName: album.name,
                        albumImage: album.images[0]?.url ?? null,
                        track: data.items[0] ?? null,
                    })
                )
        )
    );

    const topTracks = albumTracks
        .filter((a) => a.track !== null)
        .slice(0, 10)
        .map((a) => ({
            id: a.track!.id,
            name: a.track!.name,
            album: a.albumName,
            albumImage: a.albumImage,
            durationMs: a.track!.duration_ms,
        }));

    return {
        name: artist.name,
        image: artist.images[0]?.url ?? null,
        monthlyListeners,
        topTracks,
    };
}

// Debug: see raw Spotify API response without saving
app.get("/api/spotify/debug", async (_req: Request, res: Response) => {
    try {
        const data = await fetchSpotifyData();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: String(err) });
    }
});

// ── API routes ───────────────────────────────────────────────────────────────

app.get("/api/spotify", async (_req: Request, res: Response) => {
    try {
        const data = await fetchSpotifyData();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch Spotify data" });
    }
});

// Manually trigger a DB snapshot (useful for testing)
app.post("/api/spotify/snapshot", async (_req: Request, res: Response) => {
    try {
        const data = await fetchSpotifyData();
        await saveSnapshot(data.monthlyListeners, data.topTracks);
        res.json({ ok: true, capturedAt: new Date().toISOString() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Snapshot failed" });
    }
});

// DB diagnostic: shows row counts and latest snapshot
app.get("/api/spotify/db-status", async (_req: Request, res: Response) => {
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });
    try {
        const [snapshots, tracks, latest] = await Promise.all([
            db.query("SELECT COUNT(*) FROM spotify_snapshots"),
            db.query("SELECT COUNT(*) FROM spotify_tracks"),
            db.query(
                "SELECT * FROM spotify_snapshots ORDER BY captured_at DESC LIMIT 1"
            ),
        ]);
        res.json({
            snapshotCount: parseInt(snapshots.rows[0].count),
            trackCount: parseInt(tracks.rows[0].count),
            latestSnapshot: latest.rows[0] ?? null,
        });
    } catch (err) {
        res.status(500).json({ error: String(err) });
    }
});

// Read historical snapshots
app.get("/api/spotify/history", async (_req: Request, res: Response) => {
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });
    try {
        const { rows: snapshots } = await db.query(`
            SELECT s.id, s.captured_at, s.monthly_listeners,
                   json_agg(
                       json_build_object(
                           'rank', t.rank,
                           'trackId', t.track_id,
                           'name', t.name,
                           'album', t.album,
                           'albumImage', t.album_image,
                           'durationMs', t.duration_ms
                       ) ORDER BY t.rank
                   ) AS tracks
            FROM spotify_snapshots s
            JOIN spotify_tracks t ON t.snapshot_id = s.id
            GROUP BY s.id
            ORDER BY s.captured_at DESC
            LIMIT 90
        `);
        res.json(snapshots);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read history" });
    }
});

// Export all snapshots as a downloadable CSV
app.get("/api/spotify/export.csv", async (_req: Request, res: Response) => {
    const db = getPool();
    if (!db) return res.status(503).json({ error: "Database not configured" });
    try {
        const { rows } = await db.query<{
            captured_at: Date;
            monthly_listeners: number | null;
            rank: number;
            name: string;
            album: string;
            duration_ms: number;
        }>(`
            SELECT s.captured_at, s.monthly_listeners,
                   t.rank, t.name, t.album, t.duration_ms
            FROM spotify_snapshots s
            JOIN spotify_tracks t ON t.snapshot_id = s.id
            ORDER BY s.captured_at DESC, t.rank ASC
        `);

        const escape = (v: string | number | null) => {
            if (v === null || v === undefined) return "";
            const s = String(v);
            return s.includes(",") || s.includes('"') || s.includes("\n")
                ? `"${s.replace(/"/g, '""')}"`
                : s;
        };

        const header = "captured_at,monthly_listeners,rank,track_name,album,duration_ms\n";
        const body = rows
            .map((r) =>
                [
                    r.captured_at.toISOString(),
                    r.monthly_listeners,
                    r.rank,
                    escape(r.name),
                    escape(r.album),
                    r.duration_ms,
                ].join(",")
            )
            .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="spotify-history-${new Date().toISOString().slice(0, 10)}.csv"`
        );
        res.send(header + body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Export failed" });
    }
});

app.get("/api/hello", (_req: Request, res: Response) => {
    res.json({ message: "Hello from Express!" });
});

// ── Static files & catch-all ─────────────────────────────────────────────────

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// ── Start ────────────────────────────────────────────────────────────────────

async function start() {
    try {
        await initDb();
    } catch (err) {
        console.warn("DB init failed (will retry on next use):", (err as Error).message);
    }

    // Daily at midnight UTC
    cron.schedule("0 0 * * *", async () => {
        console.log("Running daily Spotify snapshot...");
        try {
            const data = await fetchSpotifyData();
            await saveSnapshot(data.monthlyListeners, data.topTracks);
        } catch (err) {
            console.error("Daily snapshot failed:", err);
        }
    });

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

start();
