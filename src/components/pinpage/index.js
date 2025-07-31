import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Box,
} from "@mui/material";
import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import SimpleResponsiveNavbar from "../../examples/Navbars/ResponsiveNavbar/allpage";
import Footer from "../../examples/Footer";
import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";
import { PinImageCarousel } from "../../components/pinpage/PinImageCarousel";
import { PinHeader } from "../../components/pinpage/PinHeader";
import { PinStats } from "../../components/pinpage/PinStats";
import PinDetailsCard from "./PinDetailsCard";
import { PinInfoEditor } from "../../components/pinpage/PinInfoEditor";
import PinMapCard from "../../components/PinMapCard";
import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { supabase } from "../../SupabaseClient";
import normalizeImages from "../../utils/normalizeImages";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import StarField from "../../components/StarField";
import FollowButton from "./FollowButton";

export default function PinPage() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { pinSlug } = useParams();
  const { state } = useLocation();
  const pinFromState = state?.pin || null;

  const [pin, setPin] = useState(pinFromState);
  const [loading, setLoading] = useState(!pinFromState);

  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);
      try {
        const name = pinSlug.replace(/_/g, " ");
        let { data: pData } = await supabase
          .from("pins")
          .select(
            `*, addedBy:profiles!pins_user_id_fkey(Username, full_name, avatar_url, user_id)`
          )
          .eq("Name", name)
          .maybeSingle();

        if (!pData) {
          const { data: allPins } = await supabase.from("pins").select("id, Name");
          const map = {};
          allPins.forEach(p => {
            map[p.Name.toLowerCase().split(" ").join("_")] = p.id;
          });
          const id = map[pinSlug];
          if (id) {
            const { data: fData } = await supabase
              .from("pins")
              .select(
                `*, addedBy:profiles!pins_user_id_fkey(Username, full_name, avatar_url, user_id)`
              )
              .eq("id", id)
              .maybeSingle();
            pData = fData;
          }
        }

        if (pData && !canceled) {
          setPin({
            ...pData,
            latitude: Number(pData.latitude),
            longitude: Number(pData.longitude),
            Images: normalizeImages(pData.Images),
            addedBy: pData.addedBy
              ? {
                  userId: pData.addedBy.user_id,
                  username:
                    pData.addedBy.Username || pData.addedBy.full_name,
                  avatarUrl: pData.addedBy.avatar_url,
                }
              : null,
          });
        }
      } catch (e) {
        console.error(e);
      }
      if (!canceled) setLoading(false);
    }
    load();
    return () => {
      canceled = true;
    };
  }, [pinSlug]);

  const updatePinInfo = async newInfo => {
    if (!pin) return;
    await supabase.from("pins").update({ Information: newInfo }).eq("id", pin.id);
    setPin(p => ({ ...p, Information: newInfo }));
  };

  if (loading)
    return (
      <DashboardLayout>
        <SimpleResponsiveNavbar />
        <MDBox p={4} textAlign="center">
          <MDTypography variant="h5">Loading pin…</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );

  if (!pin)
    return (
      <DashboardLayout>
        <SimpleResponsiveNavbar />
        <MDBox p={4} textAlign="center">
          <MDTypography variant="h5">Pin not found</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );

  const images = [];
  if (pin["Main Image"]) images.push(pin["Main Image"]);
  if (Array.isArray(pin.Images)) images.push(...pin.Images);

  return (
    <DashboardLayout>
      <SimpleResponsiveNavbar />
      <StarField />

      {isMobile && (
        <Box
          sx={{
            position: "relative",
            width: "100vw",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <PinImageCarousel images={images} />
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              display: "flex",
              gap: 1,
              bgcolor: "rgba(0,0,0,0.3)",
              p: 0.5,
              borderRadius: 2,
            }}
          >
            <PinStats
              beenThere={pin.been_there}
              wantToGo={pin.want_to_go}
              savedCount={pin.saved_count}
              onToggleBeen={() => {}}
              onToggleWant={() => {}}
              onToggleSave={() => {}}
              isBeen={false}
              isWant={false}
              isSaved={false}
              iconOnly
            />
          </Box>
        </Box>
      )}

      <MDBox
        my={1}
        sx={{
          px: { xs: 0, md: 2 },
          width: { xs: "100vw", md: "auto" },
          position: { xs: "relative", md: "static" },
          left: { xs: "50%", md: "0" },
          transform: { xs: "translateX(-50%)", md: "none" },
        }}
      >
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
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <PinHeader pin={pin} />
            </Box>
          </CardContent>
          <CardActions sx={{ px: 3, py: 2 }}>
            <Grid
              container
              spacing={2}
              direction={{ xs: "column", md: "row" }}
              alignItems="center"
              justifyContent={{ xs: "center", md: "space-between" }}
              sx={{ width: "100%" }}
            >
              <Grid item>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <Avatar
                      src={pin.addedBy?.avatarUrl}
                      sx={{
                        width: 58,
                        height: 58,
                        "& img": {
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <MDTypography variant="body2" component="div">
                      Added by{" "}
                      {pin.addedBy?.userId && pin.addedBy.userId !== currentUserId ? (
                        <MuiLink
                          component={RouterLink}
                          to={`/profile/${pin.addedBy.userId}`}
                          underline="none"
                          sx={{
                            color: "white",
                            "&:hover, &:focus, &:visited, &:active": {
                              color: "white",
                              textDecoration: "none",
                            },
                          }}
                        >
                          <strong>{pin.addedBy.username}</strong>
                        </MuiLink>
                      ) : (
                        <strong style={{ color: "white" }}>
                          {pin.addedBy?.username}
                        </strong>
                      )}
                    </MDTypography>
                    <FollowButton authorId={pin.addedBy?.userId} />
                  </Grid>
                </Grid>
              </Grid>

              {!isMobile && (
                <Grid item xs>
                  <PinStats
                    beenThere={pin.been_there}
                    wantToGo={pin.want_to_go}
                    savedCount={pin.saved_count}
                    onToggleBeen={() => {}}
                    onToggleWant={() => {}}
                    onToggleSave={() => {}}
                    isBeen={false}
                    isWant={false}
                    isSaved={false}
                  />
                </Grid>
              )}
            </Grid>
          </CardActions>
        </Card>
      </MDBox>

      {!isMobile && <PinImageCarousel images={images} />}

      {isMobile && (
        <Box
          sx={{
            position: "relative",
            width: "100vw",
            left: "50%",
            transform: "translateX(-50%)",
            mb: 4,
          }}
        >
          <PinMapCard pin={pin} />
        </Box>
      )}

      <MDBox mt={isMobile ? 0 : 4} px={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} order={{ xs: 2, md: 1 }}>
            <MDBox
              sx={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                background:
                  "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow:
                  "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                borderRadius: "12px",
                p: 3,
                mb: 3,
                "& p": { color: "white !important", mb: 1, fontSize: "18px" },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {pin.Information || ""}
              </ReactMarkdown>
            </MDBox>
            <PinInfoEditor
              initialInfo={pin.Information}
              open={infoDialogOpen}
              onClose={() => setInfoDialogOpen(false)}
              onSave={updatePinInfo}
            />
          </Grid>

          {!isMobile && (
            <Grid
              item
              xs={12}
              md={4}
              order={2}
              container
              direction="column"
              spacing={2}
            >
              <Grid item>
                <PinMapCard pin={pin} />
              </Grid>
              <Grid item>
                <PinDetailsCard pin={pin} />
              </Grid>
            </Grid>
          )}

          {isMobile && (
            <Grid item xs={12} order={3}>
              <PinDetailsCard pin={pin} />
            </Grid>
          )}
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}
