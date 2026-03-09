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
import Typography from "@mui/material/Typography";

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

function formatDuration(ms: number): string {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

function Spotify() {
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [error, setError] = useState<string | null>(null);

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
                <Box sx={{ display: "flex", gap: 4, mt: 2 }}>
                    {artist.monthlyListeners !== null && (
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="h5" fontWeight="bold">
                                {artist.monthlyListeners.toLocaleString()}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Monthly Listeners
                            </Typography>
                        </Box>
                    )}
                </Box>
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
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
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
        </Container>
    );
}

export default Spotify;
