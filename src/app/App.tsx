import { useEffect, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    useNavigate,
    useParams,
} from "react-router-dom";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import FeedOutlinedIcon from "@mui/icons-material/FeedOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Grow from "@mui/material/Grow";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AppShortcutIcon from "@mui/icons-material/AppShortcut";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import Resume from "../pages/Resume.js";
import useMediaQuery from "@mui/material/useMediaQuery";
import Prototype from "../pages/Prototype.js";
import protoTypeData from "../data/prototypes.json" with { type: "json" };
import Email from "../pages/Email.js";

type View = "Home" | "Resume" | "Prototypes" | "Emails";

function NavigationAndContent() {
    const navigate = useNavigate();
    const { prototypeName } = useParams<{ prototypeName?: string }>();

    // Object destructuring arrays from JSON
    const { prototypes } = protoTypeData;

    // Set states for navigation buttons
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<View>("Home");
    const [currentPrototype, setCurrentPrototype] = useState(prototypes[0]);

    // Determine current view based on URL
    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes("/resume")) {
            setView("Resume");
        } else if (path.includes("/prototypes")) {
            setView("Prototypes");
            setOpen(true);
            if (prototypeName) {
                const prototype = prototypes.find(
                    (p) =>
                        p.name.toLowerCase().replace(/\s+/g, "-") ===
                        prototypeName,
                );
                if (prototype) {
                    setCurrentPrototype(prototype);
                }
            }
        } else if (path.includes("/emails")) {
            setView("Emails");
        } else {
            setView("Home");
        }
    }, [prototypeName, prototypes]);

    // Update title
    useEffect(() => {
        if (view === "Prototypes" && currentPrototype) {
            document.title = `Christopher Dellosa - Prototypes - ${currentPrototype.name}`;
        } else {
            document.title = `Christopher Dellosa - ${view}`;
        }
    }, [view, currentPrototype]);

    // Toggles Prototypes Button
    const handleClick = () => {
        setOpen(!open);
    };

    // Change Views based on URL
    const changeView = (newView: View, prototype?: (typeof prototypes)[0]) => {
        setView(newView);

        if (newView === "Resume") {
            navigate("/resume");
        } else if (newView === "Prototypes" && prototype) {
            const urlName = prototype.name.toLowerCase().replace(/\s+/g, "-");
            navigate(`/prototypes/${urlName}`);
            setCurrentPrototype(prototype);
        } else if (newView === "Emails") {
            navigate("/emails");
        } else if (newView === "Home") {
            navigate("/");
        }
    };

    // Filter out Desktop only prototypes in mobile version of website
    const mobileOnlyPrototypes = prototypes.filter(
        (prototype) => prototype.isMobile,
    );

    const isDesktop = useMediaQuery("(min-width: 1150px)");

    return (
        <>
            {/** Desktop View */}
            {isDesktop && (
                <Container
                    maxWidth={view === "Home" ? "xs" : "lg"}
                    sx={{
                        paddingTop: 3,
                        paddingBottom: 3,
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        {/** Left Navigation Menu */}
                        <Grow in>
                            <Container
                                maxWidth="xs"
                                sx={{
                                    mt: 4,
                                    mb: 4,
                                    paddingBottom: 2,
                                    border: 1,
                                    borderColor: "#ababab",
                                    borderRadius: 2,
                                }}
                            >
                                <CardHeader
                                    avatar={
                                        <Avatar
                                            sx={{
                                                mt: 1,
                                                bgcolor: "black",
                                                width: 75,
                                                height: 75,
                                            }}
                                            aria-label="Christopher Dellosa Avatar"
                                            src="/self.jpg"
                                        />
                                    }
                                    title={
                                        <Typography
                                            fontWeight={"bold"}
                                            fontSize={20}
                                            letterSpacing={-0.5}
                                        >
                                            Christopher&nbsp;Dellosa
                                        </Typography>
                                    }
                                    subheader={`Frontend\u00A0Web\u00A0Developer / HTML\u00A0Email\u00A0Developer`}
                                />

                                {/** Left Navigation Menu */}
                                <List
                                    sx={{
                                        width: "100%",
                                        maxWidth: 360,
                                        bgcolor: "background.paper",
                                    }}
                                    component="nav"
                                    aria-labelledby="nested-list-subheader"
                                >
                                    {/** Resume Button */}
                                    <ListItemButton
                                        onClick={() => changeView("Resume")}
                                        selected={view === "Resume"}
                                    >
                                        <ListItemIcon>
                                            <FeedOutlinedIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Resume" />
                                    </ListItemButton>
                                    {/** LinkedIn Button */}
                                    <ListItemButton
                                        href="https://www.linkedin.com/in/christopher-dellosa-905a737/"
                                        target="_blank"
                                    >
                                        <ListItemIcon>
                                            <LinkedInIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="LinkedIn" />
                                    </ListItemButton>
                                    {/** GitHub Button */}
                                    <ListItemButton
                                        href="https://github.com/dellosac"
                                        target="_blank"
                                    >
                                        <ListItemIcon>
                                            <GitHubIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="GitHub" />
                                    </ListItemButton>
                                    {/** Prototypes Button */}
                                    <ListItemButton onClick={handleClick}>
                                        <ListItemIcon>
                                            <TipsAndUpdatesOutlinedIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Prototypes" />
                                        {open ? <ExpandLess /> : <ExpandMore />}
                                    </ListItemButton>
                                    {/** Expanded Prototype Buttons */}
                                    <Collapse
                                        in={open}
                                        timeout="auto"
                                        unmountOnExit
                                    >
                                        {/** Loop through Prototypes in prototypes.json */}
                                        {prototypes.map((prototype, index) => (
                                            <List
                                                component="div"
                                                disablePadding
                                                key={index}
                                            >
                                                <ListItemButton
                                                    sx={{ pl: 4 }}
                                                    onClick={() => {
                                                        changeView(
                                                            "Prototypes",
                                                            prototype,
                                                        );
                                                    }}
                                                    selected={
                                                        view === "Prototypes" &&
                                                        prototype.url ===
                                                            currentPrototype?.url
                                                    }
                                                >
                                                    <ListItemIcon>
                                                        {/** Show either Mobile or Desktop Icon depending on prototype */}
                                                        {prototype.isMobile ? (
                                                            <AppShortcutIcon />
                                                        ) : (
                                                            <LaptopMacIcon />
                                                        )}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={prototype.name}
                                                    />
                                                </ListItemButton>
                                            </List>
                                        ))}
                                    </Collapse>
                                    {/** Emails Button */}
                                    <ListItemButton
                                        onClick={() => changeView("Emails")}
                                        selected={view === "Emails"}
                                    >
                                        <ListItemIcon>
                                            <EmailOutlinedIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Email Template Examples" />
                                    </ListItemButton>
                                </List>
                            </Container>
                        </Grow>

                        {view === "Resume" && (
                            <Grow in={view === "Resume"}>
                                <Container
                                    maxWidth="lg"
                                    fixed
                                    sx={{
                                        mt: 4,
                                        mb: 4,
                                        paddingBottom: 2,
                                        border: 1,
                                        borderColor: "#ababab",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Resume fileUrl="/resume.pdf" />
                                </Container>
                            </Grow>
                        )}
                        {view === "Prototypes" && (
                            <Grow in={view === "Prototypes"}>
                                <Container
                                    maxWidth="lg"
                                    fixed
                                    sx={{
                                        mt: 4,
                                        mb: 4,
                                        paddingBottom: 2,
                                        border: 1,
                                        borderColor: "#ababab",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Prototype {...currentPrototype} />
                                </Container>
                            </Grow>
                        )}
                        {view === "Emails" && (
                            <Grow in={view === "Emails"}>
                                <Container
                                    maxWidth="lg"
                                    fixed
                                    sx={{
                                        mt: 4,
                                        mb: 4,
                                        paddingBottom: 2,
                                        border: 1,
                                        borderColor: "#ababab",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Email isOpen />
                                </Container>
                            </Grow>
                        )}
                    </Stack>
                </Container>
            )}
            {/** Mobile View */}
            {!isDesktop && (
                <Container
                    sx={{
                        paddingBottom: 2,
                    }}
                >
                    <CardHeader
                        avatar={
                            <Avatar
                                sx={{
                                    mt: 1,
                                    bgcolor: "black",
                                    width: 75,
                                    height: 75,
                                }}
                                aria-label="Christopher Dellosa Avatar"
                                src="/self.jpg"
                            />
                        }
                        title={
                            <Typography
                                fontWeight={"bold"}
                                fontSize={20}
                                letterSpacing={-0.5}
                            >
                                Christopher&nbsp;Dellosa
                            </Typography>
                        }
                        subheader={`Frontend\u00A0Web\u00A0Developer / HTML\u00A0Email\u00A0Developer`}
                    />

                    {/** Navigation Menu */}
                    <List
                        sx={{
                            width: "100%",
                            maxWidth: 360,
                            bgcolor: "background.paper",
                        }}
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                    >
                        {/** Resume Button */}
                        <ListItemButton href="/resume.pdf">
                            <ListItemIcon>
                                <FeedOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText primary="Resume" />
                        </ListItemButton>
                        {/** LinkedIn Button */}
                        <ListItemButton href="https://www.linkedin.com/in/christopher-dellosa-905a737/">
                            <ListItemIcon>
                                <LinkedInIcon />
                            </ListItemIcon>
                            <ListItemText primary="LinkedIn" />
                        </ListItemButton>
                        {/** GitHub Button */}
                        <ListItemButton href="https://github.com/dellosac">
                            <ListItemIcon>
                                <GitHubIcon />
                            </ListItemIcon>
                            <ListItemText primary="GitHub" />
                        </ListItemButton>
                        {/** Prototypes Button */}
                        <ListItemButton onClick={handleClick}>
                            <ListItemIcon>
                                <TipsAndUpdatesOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText primary="Prototypes" />
                            {open ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        {/** Expanded Prototype Buttons */}
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            {/** Loop through Prototypes in prototypes.json */}
                            {mobileOnlyPrototypes.map((prototype, index) => (
                                <List
                                    component="div"
                                    disablePadding
                                    key={index}
                                >
                                    <ListItemButton
                                        sx={{ pl: 4 }}
                                        href={prototype.url}
                                    >
                                        <ListItemIcon>
                                            {/** Show either Mobile or Desktop Icon depending on prototype */}
                                            {prototype.isMobile ? (
                                                <AppShortcutIcon />
                                            ) : (
                                                <LaptopMacIcon />
                                            )}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={prototype.name}
                                        />
                                    </ListItemButton>
                                </List>
                            ))}
                        </Collapse>
                        {/** Emails Button */}
                        <ListItemButton
                            onClick={() => changeView("Emails")}
                            selected={view === "Emails"}
                        >
                            <ListItemIcon>
                                <EmailOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText primary="Email Template Examples" />
                        </ListItemButton>
                    </List>
                    <Email isOpen={view === "Emails"} />
                </Container>
            )}
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<NavigationAndContent />} />
                <Route path="/resume" element={<NavigationAndContent />} />
                <Route
                    path="/prototypes/:prototypeName"
                    element={<NavigationAndContent />}
                />
                <Route path="/emails" element={<NavigationAndContent />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
