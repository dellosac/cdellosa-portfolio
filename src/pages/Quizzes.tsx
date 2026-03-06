import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useState } from "react";
import quizzes from "virtual:quiz-list";

function randomPastel() {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}, 100%, 85%)`;
}

function Quizzes() {
    const [colors, setColors] = useState<Record<number, string>>({});

    return (
        <Container
            maxWidth={"xs"}
            sx={{
                paddingTop: 3,
                paddingBottom: 3,
            }}
        >
            <List
                sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                }}
                component="nav"
                aria-labelledby="nested-list-subheader"
            >
                {quizzes.map((quiz: any, index: number) => (
                    <ListItemButton
                        key={quiz.href}
                        component="a"
                        href={quiz.href}
                        rel="noopener noreferrer"
                        onMouseEnter={() =>
                            setColors((prev) => ({
                                ...prev,
                                [index]: randomPastel(),
                            }))
                        }
                        sx={{
                            "&:hover": {
                                bgcolor: colors[index] ?? randomPastel(),
                            },
                            transition: "background-color 0.2s ease",
                        }}
                    >
                        <ListItemText primary={quiz.label} />
                    </ListItemButton>
                ))}
            </List>
        </Container>
    );
}

export default Quizzes;
