import { useState, useCallback, useMemo } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Fade from "@mui/material/Fade";
import emailData from "../data/emails.json" with { type: "json" };
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { truncate } from "../utils/stringHelpers";

const ITEM_HEIGHT = 48;

interface Email {
    name: string;
    filename: string;
}

interface EmailProps {
    isOpen: boolean;
}

function Email({ isOpen }: EmailProps) {
    const { emails } = emailData as { emails: Email[] };

    const [currentEmailPosition, setCurrentEmailPosition] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const currentEmail = emails[currentEmailPosition];
    const isFirstEmail = currentEmailPosition === 0;
    const isLastEmail = currentEmailPosition >= emails.length - 1;
    const open = Boolean(anchorEl);

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handlePrevious = useCallback(() => {
        setCurrentEmailPosition((prev) => Math.max(0, prev - 1));
    }, []);

    const handleNext = useCallback(() => {
        setCurrentEmailPosition((prev) =>
            Math.min(emails.length - 1, prev + 1),
        );
    }, [emails.length]);

    const handleSelectEmail = useCallback(
        (index: number) => {
            handleClose();
            setCurrentEmailPosition(index);
        },
        [handleClose],
    );

    const menuItems = useMemo(
        () =>
            emails.map((email, index) => (
                <MenuItem
                    key={`${email.name}-${index}`}
                    selected={index === currentEmailPosition}
                    onClick={() => handleSelectEmail(index)}
                >
                    {email.name}
                </MenuItem>
            )),
        [emails, currentEmailPosition, handleSelectEmail],
    );

    const emailImg = `/emails/${currentEmail.filename}`;

    const isDesktop = useMediaQuery("(min-width: 1150px)");

    if (!currentEmail) {
        return <Typography>No emails available</Typography>;
    }

    return (
        <>
            {/** Desktop View */}
            {isDesktop && (
                <Stack
                    direction="column"
                    spacing={1}
                    sx={{
                        padding: 4,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Box width="380px">
                        <Stack
                            direction="column"
                            spacing={1}
                            sx={{
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {/**

                            */}
                            <Typography variant="body2" fontWeight="bold">
                                {currentEmail.name}
                            </Typography>
                            <ButtonGroup
                                variant="outlined"
                                aria-label="Email navigation"
                            >
                                <Button
                                    aria-label="Previous email"
                                    onClick={handlePrevious}
                                    disabled={isFirstEmail}
                                >
                                    <ArrowBackIosIcon
                                        sx={{
                                            height: "16px",
                                            ml: "5px",
                                            mr: "-2px",
                                        }}
                                    />
                                </Button>
                                <Button
                                    aria-label="Select email from list"
                                    id="long-button"
                                    aria-controls={
                                        open ? "long-menu" : undefined
                                    }
                                    aria-expanded={open ? "true" : undefined}
                                    aria-haspopup="true"
                                    onClick={handleClick}
                                    sx={{
                                        width: "370px",
                                    }}
                                >
                                    {truncate(currentEmail.name, 36)}
                                </Button>
                                <Button
                                    aria-label="Next email"
                                    onClick={handleNext}
                                    disabled={isLastEmail}
                                >
                                    <ArrowForwardIosIcon
                                        sx={{ height: "16px" }}
                                    />
                                </Button>
                            </ButtonGroup>
                            <Menu
                                id="long-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                slotProps={{
                                    paper: {
                                        style: {
                                            maxHeight: ITEM_HEIGHT * 10,
                                            width: "65ch",
                                        },
                                    },
                                    list: {
                                        "aria-labelledby": "long-button",
                                    },
                                }}
                            >
                                {menuItems}
                            </Menu>
                        </Stack>
                    </Box>
                    <Fade
                        key={currentEmailPosition}
                        appear
                        in={!open}
                        timeout={500}
                    >
                        <img
                            src={emailImg}
                            alt={`Email: ${currentEmail.name}`}
                            width="480px"
                            loading="lazy"
                        />
                    </Fade>
                </Stack>
            )}
            {/** Mobile View */}
            {!isDesktop && (
                <Modal
                    open={isOpen}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    disableScrollLock={true}
                >
                    <Stack
                        direction="column"
                        spacing={1}
                        sx={{
                            padding: 2,
                            backgroundColor: "#ffffff",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            height: "100vh",
                        }}
                    >
                        <Fade
                            key={currentEmailPosition}
                            appear
                            in={!open}
                            timeout={500}
                        >
                            <img
                                src={emailImg}
                                alt={`Email: ${currentEmail.name}`}
                                width="100%"
                                loading="lazy"
                            />
                        </Fade>
                        <Box
                            width="100%"
                            sx={{
                                padding: "0px",
                                position: "absolute",
                                bottom: "20px",
                            }}
                        >
                            <Stack
                                direction="column"
                                spacing={1}
                                sx={{
                                    justifyContent: "flex-start",
                                    alignItems: "center",
                                }}
                            >
                                <ButtonGroup
                                    variant="outlined"
                                    aria-label="Email navigation"
                                    sx={{
                                        backgroundColor: "#ffffff",
                                        boxShadow: "0px 2px 5px #ababab",
                                    }}
                                >
                                    <Button
                                        aria-label="Previous email"
                                        onClick={handlePrevious}
                                        disabled={isFirstEmail}
                                    >
                                        <ArrowBackIosIcon
                                            sx={{
                                                height: "16px",
                                                ml: "5px",
                                                mr: "-2px",
                                            }}
                                        />
                                    </Button>
                                    <Button
                                        aria-label="Select email from list"
                                        id="long-button"
                                        aria-controls={
                                            open ? "long-menu" : undefined
                                        }
                                        aria-expanded={
                                            open ? "true" : undefined
                                        }
                                        aria-haspopup="true"
                                        onClick={handleClick}
                                        sx={{ width: "225px" }}
                                    >
                                        {truncate(currentEmail.name, 20)}
                                    </Button>
                                    <Button
                                        aria-label="Next email"
                                        onClick={handleNext}
                                        disabled={isLastEmail}
                                    >
                                        <ArrowForwardIosIcon
                                            sx={{ height: "16px" }}
                                        />
                                    </Button>
                                </ButtonGroup>
                                <Menu
                                    id="long-menu"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    slotProps={{
                                        paper: {
                                            style: {
                                                maxHeight: ITEM_HEIGHT * 10,
                                                width: "50ch",
                                            },
                                        },
                                        list: {
                                            "aria-labelledby": "long-button",
                                        },
                                    }}
                                >
                                    {menuItems}
                                </Menu>
                            </Stack>
                        </Box>
                        <IconButton
                            aria-label="close"
                            href="/"
                            sx={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Modal>
            )}
        </>
    );
}

export default Email;
