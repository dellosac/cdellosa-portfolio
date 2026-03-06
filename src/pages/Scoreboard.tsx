import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

const theme = createTheme({
    typography: { fontFamily: "Lalezar, sans-serif" },
});

interface Competitor {
    homeAway: "home" | "away";
    score: string;
    winner: boolean;
    team: {
        displayName: string;
        name: string;
        abbreviation: string;
        logo: string;
        color: string;
        alternateColor: string;
    };
}

interface Game {
    id: string;
    competitors: Competitor[];
    statusDescription: string;
    statusState: "pre" | "in" | "post";
    period: number;
    displayClock: string;
    date: string;
}

const ESPN_URL =
    "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";

function Scoreboard() {
    const [games, setGames] = useState<Game[]>([]);
    const [leagueLogo, setLeagueLogo] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
    const selectedGame = games.find((g) => g.id === selectedGameId) ?? null;

    useEffect(() => {
        document.body.style.backgroundColor = "black";
        return () => {
            document.body.style.backgroundColor = "";
        };
    }, []);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const fetchGames = () =>
            fetch(ESPN_URL)
                .then((res) => res.json())
                .then((data) => {
                    setLeagueLogo(data.leagues?.[0]?.logos?.[0]?.href ?? "");
                    const mapped: Game[] = (data.events ?? []).map(
                        (event: any) => {
                            const comp = event.competitions[0];
                            return {
                                id: event.id,
                                competitors: comp.competitors.map((c: any) => ({
                                    homeAway: c.homeAway,
                                    score: c.score,
                                    winner: c.winner,
                                    team: {
                                        displayName: c.team.displayName,
                                        name: c.team.name,
                                        abbreviation: c.team.abbreviation,
                                        logo: c.team.logo,
                                        color: c.team.color ?? "222222",
                                        alternateColor:
                                            c.team.alternateColor ?? "555555",
                                    },
                                })),
                                statusDescription: comp.status.type.description,
                                statusState: comp.status.type.state,
                                period: comp.status.period ?? 0,
                                displayClock: comp.status.displayClock ?? "",
                                date: event.date,
                            };
                        },
                    );
                    setGames((prev) => {
                        const changed =
                            JSON.stringify(prev) !== JSON.stringify(mapped);
                        return changed ? mapped : prev;
                    });
                    const hasLiveGames = mapped.some(
                        (g) => g.statusState === "in",
                    );
                    timeoutId = setTimeout(
                        fetchGames,
                        hasLiveGames ? 30_000 : 300_000,
                    );
                })
                .catch(() => {
                    setError("Failed to load scoreboard.");
                    timeoutId = setTimeout(fetchGames, 60_000);
                })
                .finally(() => setLoading(false));

        fetchGames();
        return () => clearTimeout(timeoutId);
    }, []);

    const modalStyles = {
        bgcolor: "black",
        color: "white",
    };

    return (
        <ThemeProvider theme={theme}>
            <>
                <Container
                    maxWidth="xs"
                    sx={{ paddingTop: 3, paddingBottom: 3, ...modalStyles }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                        }}
                    >
                        <Box
                            component="img"
                            src={leagueLogo}
                            alt="NBA"
                            sx={{ width: 32, height: 32, objectFit: "contain" }}
                        />
                        <Typography variant="h6">NBA Scoreboard</Typography>
                    </Box>

                    {loading && <CircularProgress size={24} />}
                    {error && <Typography color="error">{error}</Typography>}

                    {!loading && !error && games.length === 0 && (
                        <Typography color="grey.500">
                            No games today.
                        </Typography>
                    )}

                    <List disablePadding>
                        {games.map((game, i) => {
                            const away = game.competitors.find(
                                (c) => c.homeAway === "away",
                            )!;
                            const home = game.competitors.find(
                                (c) => c.homeAway === "home",
                            )!;
                            return (
                                <Box key={game.id}>
                                    {i > 0 && (
                                        <Divider
                                            sx={{ borderColor: "grey.800" }}
                                        />
                                    )}
                                    <ListItemButton
                                        onClick={() => {
                                            setSelectedGameId(game.id);
                                            document.documentElement.requestFullscreen?.();
                                        }}
                                        sx={{
                                            flexDirection: "column",
                                            alignItems: "stretch",
                                            py: 1.5,
                                            px: 1.5,
                                            "&:hover": { bgcolor: "grey.900" },
                                        }}
                                    >
                                        {[away, home].map((team) => (
                                            <Box
                                                key={team.homeAway}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    opacity:
                                                        game.statusState ===
                                                            "post" &&
                                                        !team.winner
                                                            ? 0.75
                                                            : 1,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        flex: 1,
                                                        justifyContent:
                                                            "flex-start",
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={team.team.logo}
                                                        alt={
                                                            team.team
                                                                .abbreviation
                                                        }
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            objectFit:
                                                                "contain",
                                                        }}
                                                    />
                                                    <Typography>
                                                        {team.team.displayName}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        textAlign: "right",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Typography>
                                                        {team.score}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                        <Typography
                                            variant="caption"
                                            color="grey.500"
                                            sx={{ mt: 0.5 }}
                                        >
                                            {game.statusState === "pre"
                                                ? new Date(
                                                      game.date,
                                                  ).toLocaleTimeString(
                                                      undefined,
                                                      {
                                                          hour: "numeric",
                                                          minute: "2-digit",
                                                      },
                                                  )
                                                : game.statusState === "in"
                                                  ? `Q${game.period} ${game.displayClock}`
                                                  : game.statusDescription}
                                        </Typography>
                                    </ListItemButton>
                                </Box>
                            );
                        })}
                    </List>
                </Container>

                <Dialog
                    fullScreen
                    open={!!selectedGame}
                    onClose={() => {
                        setSelectedGameId(null);
                        document.exitFullscreen?.();
                    }}
                    slotProps={{ paper: { sx: modalStyles } }}
                >
                    <IconButton
                        onClick={() => {
                            setSelectedGameId(null);
                            document.exitFullscreen?.();
                        }}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "white",
                            opacity: 0,
                            zIndex: 1,
                            transition: "opacity 0.3s ease",
                            "&:hover": { opacity: 1 },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <DialogContent
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            p: 0,
                            height: "100%",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flex: 1,
                                width: "100%",
                            }}
                        >
                            {selectedGame &&
                                [
                                    selectedGame.competitors.find(
                                        (c) => c.homeAway === "away",
                                    )!,
                                    selectedGame.competitors.find(
                                        (c) => c.homeAway === "home",
                                    )!,
                                ].map((team) => (
                                    <Box
                                        key={team.homeAway}
                                        sx={{
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 2,
                                            bgcolor: `#${team.team.color}`,
                                            paddingTop: "50px",
                                            opacity:
                                                selectedGame.statusState ===
                                                    "post" && !team.winner
                                                    ? 0.75
                                                    : 1,
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={team.team.logo}
                                            alt={team.team.abbreviation}
                                            sx={{
                                                width: "50%",
                                                height: "50%",
                                                objectFit: "contain",
                                            }}
                                        />
                                        <Typography
                                            variant="h2"
                                            textAlign="center"
                                            lineHeight={1}
                                            sx={{
                                                textShadow: "0px 6px #000000",
                                            }}
                                        >
                                            {team.team.name.toUpperCase()}
                                        </Typography>
                                        <Typography
                                            variant="h1"
                                            fontSize={375}
                                            lineHeight={1}
                                            sx={{
                                                textShadow: "0px 15px #000000",
                                            }}
                                        >
                                            {team.score}
                                        </Typography>
                                    </Box>
                                ))}
                        </Box>
                        {selectedGame && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                }}
                                className="details"
                            >
                                {selectedGame.statusState === "pre" ? (
                                    <Box
                                        sx={{
                                            backgroundColor: "#000000",
                                            padding: "7px 30px 0px 30px",
                                            marginBottom: "130px",
                                            border: "5px solid #ffffff",
                                            borderRadius: "20px",
                                            boxShadow: "0px 10px #000000",
                                            width: "225px",
                                        }}
                                    >
                                        {new Date(
                                            selectedGame.date,
                                        ).toLocaleTimeString(undefined, {
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </Box>
                                ) : selectedGame.statusState === "in" ? (
                                    <Box>
                                        <Box>
                                            <Typography
                                                variant="h1"
                                                color="#ffffff"
                                                textAlign="center"
                                                lineHeight={0.6}
                                                sx={{
                                                    py: 2,
                                                    textShadow:
                                                        "0px 10px #000000",
                                                }}
                                            >
                                                Q{selectedGame.period}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                backgroundColor: "#000000",
                                                padding: "8px 30px 0px 30px",
                                                marginBottom: "130px",
                                                border: "5px solid #ffffff",
                                                borderRadius: "20px",
                                                boxShadow: "0px 10px #000000",
                                                width: "225px",
                                            }}
                                        >
                                            <Typography
                                                variant="h2"
                                                color="white"
                                                textAlign="center"
                                                lineHeight={0.5}
                                                sx={{
                                                    py: 2,
                                                }}
                                            >
                                                {selectedGame.displayClock}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            backgroundColor: "#000000",
                                            padding: "8px 30px 0px 30px",
                                            marginBottom: "130px",
                                            border: "5px solid #ffffff",
                                            borderRadius: "20px",
                                            boxShadow: "0px 10px #000000",
                                            width: "200px",
                                        }}
                                    >
                                        <Typography
                                            variant="h2"
                                            color="white"
                                            textAlign="center"
                                            lineHeight={0.5}
                                            sx={{
                                                py: 2,
                                            }}
                                        >
                                            {selectedGame.statusDescription}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            </>
        </ThemeProvider>
    );
}

export default Scoreboard;
