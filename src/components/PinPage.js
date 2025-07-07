import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import FlagIcon from "@mui/icons-material/Flag";
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import EmailIcon from "@mui/icons-material/Email";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import DashboardLayout from "../examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "../examples/Navbars/ResponsiveNavbar/allpage";
import Footer from "../examples/Footer";
import MDBox from "./MDBox";
import MDTypography from "./MDTypography";
import { supabase } from "../SupabaseClient";
import { useSavedPins } from "./SavedPinsContext";

export default function PinPage() {
    const { pinSlug } = useParams();
    const [pin, setPin] = useState(null);
    const { pins, save, remove } = useSavedPins();

    // User toggle states (local UI state only)
    const [isBeenThere, setIsBeenThere] = useState(false);
    const [isWantToGo, setIsWantToGo] = useState(false);

    useEffect(() => {
        const fetchPin = async () => {
            const displayName = pinSlug.replace(/_/g, " ");
            const { data, error } = await supabase
                .from("pins")
                .select("*, saved_count, been_there, want_to_go")
                .eq("Name", displayName)
                .single();
            if (!error) {
                setPin(data);
            } else {
                console.error("Error loading pin:", error);
            }
        };
        fetchPin();
    }, [pinSlug]);

    // Optionally: Reset local toggles on pin change
    useEffect(() => {
        setIsBeenThere(false);
        setIsWantToGo(false);
    }, [pin?.id]);

    if (!pin) return (
        <DashboardLayout>
            <SimpleResponsiveNavbar />
            <MDBox p={4} textAlign="center">
                <MDTypography variant="h5">Loading pin...</MDTypography>
            </MDBox>
            <Footer />
        </DashboardLayout>
    );

    const isSaved = pins.some((p) => p?.id === pin?.id);

    // Toggle "Been There" with DB count update
    const toggleBeenThere = async () => {
        const newIsBeenThere = !isBeenThere;
        setIsBeenThere(newIsBeenThere);
        const newCount = newIsBeenThere
            ? (pin.been_there || 0) + 1
            : Math.max((pin.been_there || 1) - 1, 0);

        // Update Supabase
        const { error } = await supabase
            .from("pins")
            .update({ been_there: newCount })
            .eq("id", pin.id);

        if (error) {
            console.error("Failed to update been_there:", error);
            return;
        }

        // Fetch the updated pin row
        const { data: refreshedPin, error: fetchError } = await supabase
            .from("pins")
            .select("*, been_there, want_to_go, saved_count")
            .eq("id", pin.id)
            .single();

        if (fetchError) {
            console.error("Failed to fetch updated pin:", fetchError);
            return;
        }
        setPin(refreshedPin);
    };

    // Toggle "Want to Go" with DB count update
    const toggleWantToGo = async () => {
        const newIsWantToGo = !isWantToGo;
        setIsWantToGo(newIsWantToGo);
        const newCount = newIsWantToGo
            ? (pin.want_to_go || 0) + 1
            : Math.max((pin.want_to_go || 1) - 1, 0);

        // Update Supabase
        const { error } = await supabase
            .from("pins")
            .update({ want_to_go: newCount })
            .eq("id", pin.id);

        if (error) {
            console.error("Failed to update want_to_go:", error);
            return;
        }

        // Fetch the updated pin row
        const { data: refreshedPin, error: fetchError } = await supabase
            .from("pins")
            .select("*, been_there, want_to_go, saved_count")
            .eq("id", pin.id)
            .single();

        if (fetchError) {
            console.error("Failed to fetch updated pin:", fetchError);
            return;
        }
        setPin(refreshedPin);
    };

    // Toggle "Saved" (Heart)
    const toggleSave = async () => {
        const newCount = isSaved
            ? Math.max((pin.saved_count || 1) - 1, 0)
            : (pin.saved_count || 0) + 1;

        // Update Supabase
        const { error } = await supabase
            .from("pins")
            .update({ saved_count: newCount })
            .eq("id", pin.id);

        if (error) {
            console.error("Failed to update saved_count:", error);
            return;
        }

        // Fetch the updated pin row
        const { data: refreshedPin, error: fetchError } = await supabase
            .from("pins")
            .select("*, saved_count, been_there, want_to_go")
            .eq("id", pin.id)
            .single();

        if (fetchError) {
            console.error("Failed to fetch updated pin:", fetchError);
            return;
        }

        setPin(refreshedPin);
        isSaved ? remove(refreshedPin) : save(refreshedPin);
    };

    const additionalImages = Array.isArray(pin.Images) ? pin.Images : [];

    return (
        <DashboardLayout>
            <SimpleResponsiveNavbar />

            <MDBox my={4} px={2}>
                <Card sx={{
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    background:
                        "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.6)",
                    boxShadow:
                        "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                    borderRadius: "12px",
                }}>
                    <CardContent>
                        <Grid container spacing={4} alignItems="center">
                            {/* Title + subtitle + description */}
                            <Grid item xs={12} md={6} mt={1} >
                                {(pin.City || pin.countryName) && (
                                    <MDTypography variant="subtitle1" color="text">
                                        {pin.City ? pin.City : ""}
                                        {pin.City && pin.countryName ? ", " : ""}
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

                            {/* Stats */}
                            <Grid item xs={12} md={6}>
                                <Grid container spacing={2} justifyContent="space-evenly">
                                    <Grid item textAlign="center">
                                        <IconButton
                                            type="button"
                                            size="large"
                                            onClick={toggleBeenThere}
                                        >
                                            {isBeenThere
                                                ? <FlagIcon sx={{ color: "green" }} />
                                                : <OutlinedFlagIcon sx={{ color: "green" }} />}
                                        </IconButton>
                                        <MDTypography variant="h5">{pin.been_there ?? 0}</MDTypography>
                                        <MDTypography variant="caption">Been here</MDTypography>
                                    </Grid>
                                    <Grid item textAlign="center">
                                        <IconButton
                                            type="button"
                                            size="large"
                                            onClick={toggleWantToGo}
                                        >
                                            {isWantToGo
                                                ? <StarIcon sx={{ color: "gold" }} />
                                                : <StarBorderIcon sx={{ color: "gold" }} />}
                                        </IconButton>
                                        <MDTypography variant="h5">{pin.want_to_go ?? 0}</MDTypography>
                                        <MDTypography variant="caption">Want to go</MDTypography>
                                    </Grid>
                                    <Grid item textAlign="center">
                                        <IconButton
                                            type="button"
                                            size="large"
                                            sx={{ color: "error.main" }}
                                            onClick={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleSave();
                                            }}
                                        >
                                            {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                        </IconButton>
                                        <MDTypography variant="h5">{pin.saved_count ?? 0}</MDTypography>
                                        <MDTypography variant="caption">Saved</MDTypography>
                                    </Grid>
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

            <MDBox mt={4} px={2}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <MDTypography variant="body1" mb={2} sx={{ lineHeight: 1.8 }}>
                            {pin.Information}
                        </MDTypography>

                        {additionalImages.length > 0 && (
                            <Grid container spacing={2}>
                                {additionalImages.map((img, idx) => (
                                    <Grid item xs={12} sm={6} key={idx}>
                                        <MDBox
                                            component="img"
                                            src={img}
                                            alt={pin.Name}
                                            width="100%"
                                            borderRadius="lg"
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <MDBox
                            p={2}
                            sx={{
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                background:
                                    "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
                                border: "1px solid rgba(255, 255, 255, 0.6)",
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
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}
