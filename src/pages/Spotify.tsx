import { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { LineChart } from "@mui/x-charts/LineChart";

interface Track {
    id: string;
    name: string;
    album: string;
    albumImage: string | null;
    durationMs: number;
}

interface ArtistData {
    name: string;
    image: string | null;
    monthlyListeners: number | null;
    topTracks: Track[];
}

interface HistoryTrack {
    rank: number;
    trackId: string;
    name: string;
    album: string;
    albumImage: string | null;
    durationMs: number;
}

interface Snapshot {
    id: number;
    captured_at: string;
    monthly_listeners: number | null;
    tracks: HistoryTrack[];
}

function formatDuration(ms: number): string {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function NowTab({ artist }: { artist: ArtistData }) {
    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                {artist.image && (
                    <Box
                        component="img"
                        src={artist.image}
                        alt={artist.name}
                        sx={{
                            width: 160,
                            height: 160,
                            borderRadius: "50%",
                            mb: 2,
                            objectFit: "cover",
                        }}
                    />
                )}
                <Typography variant="h5" fontWeight="bold">
                    {artist.name}
                </Typography>
                {artist.monthlyListeners !== null && (
                    <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Typography variant="h5" fontWeight="bold">
                            {artist.monthlyListeners.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Monthly Listeners
                        </Typography>
                    </Box>
                )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Top Songs
            </Typography>
            <List disablePadding>
                {artist.topTracks.map((track, i) => (
                    <ListItem key={track.id} disableGutters>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ width: 24, flexShrink: 0 }}
                        >
                            {i + 1}
                        </Typography>
                        <ListItemAvatar sx={{ minWidth: 52 }}>
                            <Avatar
                                src={track.albumImage ?? undefined}
                                variant="rounded"
                                sx={{ width: 40, height: 40 }}
                            />
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="body2" fontWeight="medium">
                                    {track.name}
                                </Typography>
                            }
                            secondary={
                                <Typography variant="caption" color="text.secondary">
                                    {track.album}
                                </Typography>
                            }
                        />
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 1, flexShrink: 0 }}
                        >
                            {formatDuration(track.durationMs)}
                        </Typography>
                    </ListItem>
                ))}
            </List>
        </>
    );
}

function HistoryTab() {
    const [snapshots, setSnapshots] = useState<Snapshot[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<number>(0);

    useEffect(() => {
        fetch("/api/spotify/history")
            .then((r) => r.json())
            .then((data) => {
                if (data.error) setError(data.error);
                else setSnapshots(data);
            })
            .catch(() => setError("Failed to load history."));
    }, []);

    if (error)
        return (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
                History is only available on the live site.
            </Typography>
        );
    if (!snapshots) return <CircularProgress />;
    if (snapshots.length === 0)
        return (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
                No snapshots yet.
            </Typography>
        );

    const snap = snapshots[selected];

    const chartData = [...snapshots].reverse().filter((s) => s.monthly_listeners !== null);

    return (
        <>
            {/* Listeners over time chart */}
            {chartData.length > 1 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Monthly Listeners Over Time
                    </Typography>
                    <LineChart
                        xAxis={[{
                            data: chartData.map((s) => new Date(s.captured_at)),
                            scaleType: "time",
                            tickMinStep: 3600 * 1000 * 24,
                        }]}
                        series={[{
                            data: chartData.map((s) => s.monthly_listeners as number),
                            label: "Monthly Listeners",
                            showMark: chartData.length <= 30,
                        }]}
                        height={220}
                        margin={{ left: 70, right: 20, top: 20, bottom: 40 }}
                    />
                </Box>
            )}

            {/* Snapshot selector */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""} captured
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    mb: 3,
                }}
            >
                {snapshots.map((s, i) => (
                    <Box
                        key={s.id}
                        onClick={() => setSelected(i)}
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: "pointer",
                            border: "1px solid",
                            borderColor: i === selected ? "primary.main" : "divider",
                            bgcolor: i === selected ? "primary.main" : "transparent",
                            color: i === selected ? "primary.contrastText" : "text.primary",
                        }}
                    >
                        <Typography variant="caption">{formatDate(s.captured_at)}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Stats row */}
            {snap.monthly_listeners !== null && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {snap.monthly_listeners.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Monthly Listeners
                    </Typography>
                </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Tracks table */}
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Track</TableCell>
                        <TableCell>Album</TableCell>
                        <TableCell align="right">Duration</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {snap.tracks.map((t) => (
                        <TableRow key={t.trackId} hover>
                            <TableCell>{t.rank}</TableCell>
                            <TableCell>{t.name}</TableCell>
                            <TableCell sx={{ color: "text.secondary" }}>{t.album}</TableCell>
                            <TableCell align="right" sx={{ color: "text.secondary" }}>
                                {formatDuration(t.durationMs)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}

function Spotify() {
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        fetch("/api/spotify")
            .then((res) => res.json())
            .then((data) => {
                if (data.error) setError(data.error);
                else setArtist(data);
            })
            .catch(() => setError("Failed to load artist data."));
    }, []);

    if (error) return <Typography color="error">{error}</Typography>;
    if (!artist) return <CircularProgress />;

    return (
        <Container maxWidth="sm" sx={{ pt: 4, pb: 6 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="Now" />
                <Tab label="History" />
            </Tabs>
            {tab === 0 && <NowTab artist={artist} />}
            {tab === 1 && <HistoryTab />}
        </Container>
    );
}

export default Spotify;
