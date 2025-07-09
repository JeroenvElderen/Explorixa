import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import DOMPurify from 'dompurify';
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import FlagIcon from "@mui/icons-material/Flag";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardLayout from "../examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "../examples/Navbars/ResponsiveNavbar/allpage";
import Footer from "../examples/Footer";
import MDBox from "./MDBox";
import MDTypography from "./MDTypography";
import { supabase } from "../SupabaseClient";
import { useSavedPins } from "./SavedPinsContext";
import PinMapCard from "./PinMapCard";
import { Delete } from "@mui/icons-material";

// Safely normalize your Images column into an array of URLs
function normalizeImages(raw) {
    if (Array.isArray(raw)) return raw;
    if (typeof raw !== "string" || !raw.trim()) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch { }
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.length > 1 ? parts : [raw.trim()];
}

const sluggify = (str) =>
    str
        ?.toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^\w-]/g, "") ?? "";

export default function PinPage() {
    const { pinSlug } = useParams();
    const { state } = useLocation();
    const pinFromState = state?.pin ?? null;
    const { pins, save, remove } = useSavedPins();

    // Pin data & UI state
    const [pin, setPin] = useState(pinFromState);
    const [loading, setLoading] = useState(!pinFromState);
    const [isBeenThere, setIsBeenThere] = useState(false);
    const [isWantToGo, setIsWantToGo] = useState(false);

    // "Save to list" dialog state
    const [listDialogOpen, setListDialogOpen] = useState(false);
    const [lists, setLists] = useState([]);
    const [selectedLists, setSelectedLists] = useState([]);
    const [newListName, setNewListName] = useState("");

    // Auth session & user
    const [user, setUser] = useState(null);

    // Subscribe to auth state, keep session.user in state
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    // Compute saved-state from context
    const isSaved = pins.some((p) => p.id === pin?.id);

    // Fetch the user's lists whenever the dialog is opened
    useEffect(() => {
        if (!listDialogOpen || !user) return;
        (async () => {
            const { data, error } = await supabase
                .from("lists")
                .select("id, name")
                .eq("user_id", user.id);
            if (!error) setLists(data);
        })();
    }, [listDialogOpen, user]);

    // Handlers for the "save" / "unsave" workflow
    const handleSaveClick = async () => {
        if (!user) {
            console.error("Please sign in to manage your saved pins");
            return;
        }

        if (!isSaved) {
            // Not yet saved → show "add to list" dialog
            setListDialogOpen(true);
            return;
        }

        // Already saved → remove from all of this user's lists
        const { data: userLists, error: listErr } = await supabase
            .from("lists")
            .select("id")
            .eq("user_id", user.id);
        if (listErr) {
            console.error(listErr);
            return;
        }
        await supabase
            .from("list_pins")
            .delete()
            .in("list_id", userLists.map((l) => l.id))
            .eq("pin_id", pin.id);

        // Also update the pin’s saved_count & context
        await toggleSave();
    };

    const handleDeleteList = async (listId) => {
        if (!user) return;
        // remove from Supabase
        const { error } = await supabase
            .from("lists")
            .delete()
            .eq("id", listId)
            .eq("user_id", user.id);
        if (error) {
            console.error("delete list failed", error);
            return;
        }
        // update local UI state
        setLists((prev) => prev.filter((l) => l.id !== listId));
        // also remove from any checked boxes
        setSelectedLists((prev) => prev.filter((id) => id !== listId));
    };

    const handleDialogClose = () => {
        setListDialogOpen(false);
        setSelectedLists([]);
        setNewListName("");
    };

    const handleToggleList = (listId) => {
        setSelectedLists((prev) =>
            prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
        );
    };

    const handleCreateAndSave = async () => {
        if (!user) return;

        // 1) Optionally create a new list
        let createdListId = null;
        if (newListName.trim()) {
            const { data, error } = await supabase
                .from("lists")
                .insert({ user_id: user.id, name: newListName.trim() })
                .single();
            if (!error) createdListId = data.id;
        }

        // 2) Determine lists to save
        const allListIds = [...selectedLists, ...(createdListId ? [createdListId] : [])];

        // If no lists chosen, just toggle save and close
        if (allListIds.length === 0) {
            await toggleSave();
            handleDialogClose();
            return;
        }

        // 3) Upsert pin into each selected list
        await Promise.all(
            allListIds.map((listId) =>
                supabase.from("list_pins").upsert({ list_id: listId, pin_id: pin.id })
            )
        );

        // 4) Toggle save state
        await toggleSave();
        handleDialogClose();
    };

    // Original pin-actions
    const toggleBeenThere = async () => {
        const next = !isBeenThere;
        const newCount = next
            ? (pin.been_there || 0) + 1
            : Math.max((pin.been_there || 1) - 1, 0);
        setIsBeenThere(next);
        setPin((p) => ({ ...p, been_there: newCount }));
        await supabase.from("pins").update({ been_there: newCount }).eq("id", pin.id);
    };

    const toggleWantToGo = async () => {
        const next = !isWantToGo;
        const newCount = next
            ? (pin.want_to_go || 0) + 1
            : Math.max((pin.want_to_go || 1) - 1, 0);
        setIsWantToGo(next);
        setPin((p) => ({ ...p, want_to_go: newCount }));
        await supabase.from("pins").update({ want_to_go: newCount }).eq("id", pin.id);
    };

    const toggleSave = async () => {
        const newCount = isSaved
            ? Math.max((pin.saved_count || 1) - 1, 0)
            : (pin.saved_count || 0) + 1;
        setPin((p) => ({ ...p, saved_count: newCount }));
        await supabase.from("pins").update({ saved_count: newCount }).eq("id", pin.id);
        isSaved ? remove(pin) : save(pin);
    };

    // Load pin data on mount / slug change
    useEffect(() => {
        let cancelled = false;

        const loadPin = async () => {
            setLoading(true);

            try {
                const nameFromSlug = pinSlug?.replace(/_/g, " ");

                // Try fetching pin by name
                let { data: pinData, error } = await supabase
                    .from("pins")
                    .select(`
          *,
          addedBy:profiles!pins_user_id_fkey(
          Username
            full_name,
            avatar_url,
            user_id
          )
        `)
                    .eq("Name", nameFromSlug)
                    .maybeSingle();

                // Fallback: try by slug-to-id mapping if above fails
                if (!pinData && !cancelled) {
                    const { data: allPins } = await supabase
                        .from("pins")
                        .select(`id, \"Name\"`);

                    const slugMap = {};
                    allPins?.forEach((p) => slugMap[sluggify(p.Name)] = p.id);
                    const fallbackId = slugMap[sluggify(pinSlug)];

                    if (fallbackId) {
                        const { data: fallbackPin } = await supabase
                            .from("pins")
                            .select(`
              *,
              addedBy:profiles!pins_user_id_fkey(
                Username,
                full_name,
                avatar_url,
                user_id
              )
            `)
                            .eq("id", fallbackId)
                            .maybeSingle();

                        pinData = fallbackPin;
                    }
                }

                // If pin found, format and set it
                if (pinData && !cancelled) {
                    setPin({
                        ...pinData,
                        latitude: Number(pinData.latitude),
                        longitude: Number(pinData.longitude),
                        Images: normalizeImages(pinData.Images),
                        addedBy: pinData.addedBy
                            ? {
                                username: pinData.addedBy.Username || pinData.addedBy.full_name,
                                avatarUrl: pinData.addedBy.avatar_url,
                                userId: pinData.addedBy.user_id,
                            }
                            : null,
                    });
                } else {
                    console.warn("No pin found for slug:", pinSlug);
                }

            } catch (err) {
                console.error("Error loading pin:", err);
            }

            if (!cancelled) setLoading(false);
        };

        loadPin();

        return () => { cancelled = true; };
    }, [pinSlug]);

    // Reset toggles on pin change
    useEffect(() => {
        setIsBeenThere(false);
        setIsWantToGo(false);
    }, [pin?.id]);

    if (loading) {
        return (
            <DashboardLayout>
                <SimpleResponsiveNavbar />
                <MDBox p={4} textAlign="center">
                    <MDTypography variant="h5">Loading pin…</MDTypography>
                </MDBox>
                <Footer />
            </DashboardLayout>
        );
    }
    if (!pin) {
        return (
            <DashboardLayout>
                <SimpleResponsiveNavbar />
                <MDBox p={4} textAlign="center">
                    <MDTypography variant="h5">Pin not found.</MDTypography>
                </MDBox>
                <Footer />
            </DashboardLayout>
        );
    }

    const additionalImages = normalizeImages(pin.Images);

    return (
        <DashboardLayout>
            <SimpleResponsiveNavbar />
            <MDBox my={1} px={2}>
                <Card
                    sx={{
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        background:
                            "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
                        border: "1px solid rgba(255,255,255,0.6)",
                        boxShadow:

                            "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                        borderRadius: "12px",
                    }}
                >
                    <CardContent>
                        <Grid container spacing={4} alignItems="center" justifyContent="space-between">
                            <Grid item xs={12} md={6} mt={1}>
                                {(pin.City || pin.countryName) && (
                                    <MDTypography variant="subtitle1" color="text">
                                        {pin.City}
                                        {pin.City && pin.countryName && ", "}
                                        {pin.countryName}
                                    </MDTypography>
                                )}
                                <MDTypography variant="h3" gutterBottom>
                                    {pin.Name}
                                </MDTypography>
                                <MDTypography variant="body2" color="text" sx={{ mt: 1 }}>
                                    {pin["Post Summary"]}
                                </MDTypography>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                md="auto"
                                container
                                spacing={2}
                                justifyContent="flex-end"
                            >
                                <Grid item textAlign="center">
                                    <IconButton size="large" onClick={toggleBeenThere}>
                                        {isBeenThere ? (
                                            <FlagIcon sx={{ color: "green" }} />
                                        ) : (
                                            <OutlinedFlagIcon sx={{ color: "green" }} />
                                        )}
                                    </IconButton>
                                    <MDTypography variant="h5">{pin.been_there ?? 0}</MDTypography>
                                    <MDTypography variant="caption">Been here</MDTypography>
                                </Grid>
                                <Grid item textAlign="center">
                                    <IconButton size="large" onClick={toggleWantToGo}>
                                        {isWantToGo ? (
                                            <StarIcon sx={{ color: "gold" }} />
                                        ) : (
                                            <StarBorderIcon sx={{ color: "gold" }} />
                                        )}
                                    </IconButton>
                                    <MDTypography variant="h5">{pin.want_to_go ?? 0}</MDTypography>
                                    <MDTypography variant="caption">Want to go</MDTypography>
                                </Grid>
                                <Grid item textAlign="center">
                                    <IconButton
                                        size="large"
                                        sx={{ color: "error.main" }}
                                        onClick={handleSaveClick}
                                    >
                                        {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                    <MDTypography variant="h5">{pin.saved_count ?? 0}</MDTypography>
                                    <MDTypography variant="caption">Saved</MDTypography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>

                    <CardActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
                        <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                                <Avatar src={pin.addedBy?.avatarUrl} />
                            </Grid>
                            <Grid item>
                                <MDTypography variant="body2">
                                    Added by <strong>{pin.addedBy?.username}</strong>
                                </MDTypography>
                            </Grid>
                        </Grid>
                    </CardActions>
                </Card>
            </MDBox>

            {additionalImages.length > 0 && (
                <MDBox my={3} px={2}>
                    <Slider
                        dots
                        infinite
                        speed={500}
                        slidesToShow={2}
                        slidesToScroll={2}
                        arrows
                        adaptiveHeight
                        responsive={[{ breakpoint: 900, settings: { slidesToShow: 1, slidesToScroll: 1 } }]}
                    >
                        {[pin["Main Image"], ...additionalImages]
                            .filter((x, i, a) => x && a.indexOf(x) === i)
                            .map((img, i) => (
                                <MDBox
                                    key={i}
                                    component="img"
                                    src={img}
                                    alt={`${pin.Name} image ${i + 1}`}
                                    width="100%"
                                    maxHeight="350px"
                                    borderRadius="lg"
                                    sx={{ objectFit: "cover", mx: "auto" }}
                                />
                            ))}
                    </Slider>
                </MDBox>
            )}

            <MDBox mt={4} px={2}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <div style={{ color: "white" }}
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(pin.Information || '')
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4} container direction="column" spacing={2}>
                        <Grid item>
                            <PinMapCard pin={pin} />
                        </Grid> 
                        <Grid item>
                            <MDBox
                                p={2}
                                sx={{
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                    background:
                                        "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
                                    border: "1px solid rgba(255,255,255,0.6)",
                                    boxShadow:
                                        "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                                    borderRadius: "12px",
                                }}
                            >
                                <MDTypography variant="h6" mb={1}>
                                    Details
                                </MDTypography>
                                {pin.Category && (
                                    <MDTypography variant="body2" mb={0.5}>
                                        Category: {pin.Category}
                                    </MDTypography>
                                )}
                                {pin.Ranking && (
                                    <MDTypography variant="body2" mb={0.5}>
                                        Ranking: {pin.Ranking}
                                    </MDTypography>
                                )}
                                {pin["Average Costs"] && (
                                    <MDTypography variant="body2" mb={0.5}>
                                        Average Cost: {pin["Average Costs"]}
                                    </MDTypography>
                                )}
                            </MDBox>
                        </Grid>
                    </Grid>
                </Grid>
            </MDBox>

            {/* "Add to list" Dialog */}
            <Dialog open={listDialogOpen} onClose={handleDialogClose}
                PaperProps={{
                    sx: {
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        background:
                            "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
                        border: "1px solid rgba(255,255,255,0.6)",
                        boxShadow:
                            "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                        borderRadius: "12px",
                        p: 2,                // inner padding
                        minWidth: 300,       // grow to taste
                    }
                }}
            >
                <DialogTitle>Add to a list</DialogTitle>
                <DialogContent
                >
                    <List>
                        {lists.map((l) => (
                            <ListItem
                                key={l.id}
                                dense
                                secondaryAction={
                                    <IconButton
                                        sx={{
                                            color: "#F18F01"
                                        }}
                                        edge="end"
                                        onClick={() => handleDeleteList(l.id)}
                                        size="small"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                }
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            color="default"
                                            disableRipple
                                            checked={selectedLists.includes(l.id)}
                                            onChange={() => handleToggleList(l.id)}
                                            sx={{
                                                // unchecked color
                                                color: "#ccc",

                                                // ensure the box is transparent when unchecked
                                                "& .MuiSvgIcon-root": {
                                                    fill: "transparent",
                                                },

                                                // checked overrides
                                                "&.Mui-checked": {
                                                    color: "#F18F01",

                                                    // fill the box when checked
                                                    "& .MuiSvgIcon-root": {
                                                        fill: "#F18F01",
                                                    },
                                                },

                                                // remove the blue hover ripple
                                                "&:hover": {
                                                    backgroundColor: "transparent",
                                                },
                                            }}
                                        />
                                    }
                                    label={l.name}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Or create new list"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button sx={{ color: "#F18F01", "&:hover": { backgroundColor: "transparent", color: "#fff" } }} onClick={handleDialogClose}>Cancel</Button>
                    <Button
                        variant="contained"
                        sx={{
                            background: "#F18F01 !important",
                            color: "white !important"
                        }}
                        onClick={handleCreateAndSave}
                        disabled={(!selectedLists.length && !newListName.trim()) || !user}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Footer />
        </DashboardLayout>
    );
}
