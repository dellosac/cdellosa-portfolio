import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import quizzes from "virtual:quiz-list";

function Quizzes() {
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
                {quizzes.map((quiz: any) => (
                    <ListItemButton
                        key={quiz.href}
                        component="a"
                        href={quiz.href}
                        rel="noopener noreferrer"
                    >
                        <ListItemText primary={quiz.label} />
                    </ListItemButton>
                ))}
            </List>
        </Container>
    );
}

export default Quizzes;
