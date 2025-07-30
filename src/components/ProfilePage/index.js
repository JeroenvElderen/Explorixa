import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "SupabaseClient";
import { Grid } from "@mui/material";
import MDBox from "components/MDBox";
import SimpleResponsiveNavbar from "examples/Navbars/ResponsiveNavbar/allpage";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import StarField from "components/StarField";
import { useSavedPins } from "components/SavedPinsContext";
import ProfileHeader from "./ProfileHeader";
import ProfileSidebar from "./ProfileSidebar";
import PinsSection from "./PinsSection";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import ListDialog from "components/AddToList/AddToListDialog";
import PhotoGalleryGrid from "./PhotoGalleryGrid";
import ListsSection from "./ListSection";
import InfoEditorDialog from "components/PlaceConfigurator/InfoEditorDialog";
import CreatePostSection from "./CreatePostSection";
import Box from "@mui/material/Box";
import EditProfileCard from "./EditProfileCard";

export default function ProfilePage() {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(paramUserId || null);
  const [profile, setProfile] = useState(null);
  const [pins, setPins] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [latestPhotos, setLatestPhotos] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPins, setLoadingPins] = useState(true);
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [dialogPin, setDialogPin] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState([]);
  const [sessionUser, setSessionUser] = useState(null);
  const isOwner = sessionUser?.id === userId;
  const [editingProfile, setEditingProfile] = useState(false);
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const {
    pins: savedPins,
    save,
    remove,
    beenTherePins,
    saveBeenThere,
    removeBeenThere,
    wantToGoPins,
    saveWantToGo,
    removeWantToGo,
  } = useSavedPins();

  const openPhotosTab = () => {
    setSelectedTab("photos");
  };

  const [selectedTab, setSelectedTab] = useState("posts");

  const navItems = [
    { key: "posts", label: "Posts" },
    { key: "photos", label: "Photos" },
    ...(isOwner ? [{ key: "lists", label: "My lists" }] : []),
  ];

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [editingText, setEditingText] = useState("");
  const bgRef = useRef(null);

  // Open dialog
  const handleEditClick = (pin) => {
    setEditingPin(pin);
    setEditingText(pin.Information || "");
    setEditorOpen(true);
  };

  // Save edited info
  const handleEditorSave = async () => {
    if (!editingPin) return;

    const { error } = await supabase
      .from("pins")
      .update({ Information: editingText })
      .eq("id", editingPin.id);

    if (error) {
      console.error("Error updating pin info:", error);
    } else {
      setPins((pins) =>
        pins.map((p) =>
          p.id === editingPin.id ? { ...p, Information: editingText } : p
        )
      );
    }

    setEditorOpen(false);
    setEditingPin(null);
  };

  // Resolve logged-in user ID if not passed in URL
  useEffect(() => {
    if (!paramUserId) {
      supabase.auth.getUser().then(({ data: { user }, error }) => {
        if (error || !user) {
          console.error("Not authenticated or error:", error);
          return navigate("/authentication/sign-in");
        }
        setUserId(user.id);
      });
    }
  }, [paramUserId, navigate]);

useEffect(() => {
  if (paramUserId) {
    setUserId(paramUserId);
  }
}, [paramUserId]);

  // Fetch user lists
useEffect(() => {
  if (!userId) return;
  setLoadingLists(true);
   supabase
   .from("lists")
   .select(`
     id,
     name,
     created_at,
     list_pins (
       pins (
         id,
         "Name",
         "Main Image",
         created_at,
         been_there,
         want_to_go,
         saved_count,
         "Information",
         "Images"
       )
     )
   `)
   .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .then(({ data, error }) => {
      if (error) console.error("Error loading lists:", error);
      else 
              setLists(
        (data || []).map((lst) => ({
          id: lst.id,
          name: lst.name,
          created_at: lst.created_at,
          pins: (lst.list_pins || []).map((lp) => lp.pins),
        }))
      );
    })
    .finally(() => setLoadingLists(false));
}, [userId]);


  // Fetch followers
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("follows")
      .select(
        "follower_id, profiles:follower_id (user_id, full_name, Username, avatar_url)"
      )
      .eq("followee_id", userId)
      .then(({ data, error }) => {
        if (error) return console.error(error);
        setFollowers(data.map((e) => e.profiles).filter(Boolean));
      });
  }, [userId]);

  // Fetch profile
  useEffect(() => {
    if (!userId) return;
    setLoadingProfile(true);
    supabase
      .from("profiles")
      .select(
        "user_id, Username, full_name, email, location, avatar_url, description, from_location, background_url"
      )
      .eq("user_id", userId)
      .single()
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setProfile(data);
      })
      .finally(() => setLoadingProfile(false));
  }, [userId]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        console.warn("Failed to get logged-in user");
        setSessionUser(null);
      } else {
        setSessionUser(user);
      }
    });
  }, []);

  // Fetch pins and photos
  useEffect(() => {
    if (!userId) return;
    setLoadingPins(true);
    supabase
      .from("pins")
      .select(
        '*'
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else {
          setPins(data || []);
          const photos = (data || [])
            .flatMap((pin) => {
              let urls = [];
              try {
                const parsed = JSON.parse(pin.Images || "[]");
                urls = Array.isArray(parsed) ? parsed.map((u) => u.trim()) : [];
              } catch {
                urls = (pin.Images || "").split(",").map((u) => u.trim());
              }
              const main = pin["Main Image"]?.trim();
              if (main) urls = [main, ...urls.filter((u) => u !== main)];
              return urls.map((src) => ({
                src,
                created_at: new Date(pin.created_at),
              }));
            })
            .sort((a, b) => b.created_at - a.created_at)
            .slice(0, 9);
          setLatestPhotos(photos);
        }
      })
      .finally(() => setLoadingPins(false));
  }, [userId]);

  const toggleBeenThere = async (pin) => {
    const next = !beenTherePins.some((p) => p.id === pin.id);
    const newCount = next
      ? (pin.been_there || 0) + 1
      : Math.max((pin.been_there || 1) - 1, 0);
    await supabase
      .from("pins")
      .update({ been_there: newCount })
      .eq("id", pin.id);
    next ? saveBeenThere(pin) : removeBeenThere(pin);
    setPins((arr) =>
      arr.map((p) => (p.id === pin.id ? { ...p, been_there: newCount } : p))
    );
  };

  const toggleWantToGo = async (pin) => {
    const next = !wantToGoPins.some((p) => p.id === pin.id);
    const newCount = next
      ? (pin.want_to_go || 0) + 1
      : Math.max((pin.want_to_go || 1) - 1, 0);
    await supabase
      .from("pins")
      .update({ want_to_go: newCount })
      .eq("id", pin.id);
    next ? saveWantToGo(pin) : removeWantToGo(pin);
    setPins((arr) =>
      arr.map((p) => (p.id === pin.id ? { ...p, want_to_go: newCount } : p))
    );
  };

  const handleSaveClick = (pin) => {
    setDialogPin(pin);
    setListDialogOpen(true);
  };

  const handleDialogSaved = () => {
    setPins((arr) =>
      arr.map((p) =>
        p.id === dialogPin.id
          ? { ...p, saved_count: (p.saved_count || 0) + 1 }
          : p
      )
    );
    save(dialogPin);
    setListDialogOpen(false);
    setDialogPin(null);
  };

  if (!userId) {
    return <div>Loading profile...</div>;
  }

  return (
    <DashboardLayout>
      <SimpleResponsiveNavbar />
      <StarField backgroundUrl={profile?.background_url} bgRef={bgRef} />
      <MDBox px={2} py={4} maxWidth="100vw" mx="auto">
        {/* Profile header (full width) */}
        <ProfileHeader
          profile={profile}
          loading={loadingProfile}
          items={navItems}
          onSelect={setSelectedTab}
          followerCount={followers.length}
          isOwner={isOwner}
          onEditClick={() => setEditingProfile((prev) => !prev)}
          editing={editingProfile}
        />

        {selectedTab === "photos" ? (
          // Show ONLY the PhotoGalleryGrid full width, hide sidebars and pins
          <Box mt={2}>
            <PhotoGalleryGrid
              photos={latestPhotos}
              openLightbox={(slides, idx) => {
                setLightboxSlides(slides);
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
            />
          </Box>
        ) : selectedTab === "lists" && isOwner ? (
          <Box mt={2}>
            <ListsSection 
                lists={lists}
    loading={loadingLists}
    setPins={setPins}
    profile={profile}
    savedPins={savedPins}
    beenTherePins={beenTherePins}
    wantToGoPins={wantToGoPins}
    toggleBeenThere={toggleBeenThere}
    toggleWantToGo={toggleWantToGo}
    handleSaveClick={handleSaveClick}
    loadingPins={false}
    openLightbox={(slides, idx) => {
      setLightboxSlides(slides);
      setLightboxIndex(idx);
      setLightboxOpen(true);
    }}
    onEditClick={handleEditClick}
    isOwner={isOwner}
  />
          </Box>
        ) : (
          // Default layout with sidebars and pins
          <Grid container spacing={2} sx={{ mt: 0 }}>
            {/* Left sidebar */}
            <Grid item xs={12} md={3}>
              <ProfileSidebar
                profile={profile}
                followers={followers}
                latestPhotos={latestPhotos}
                navigate={navigate}
                openLightbox={(slides, idx) => {
                  setLightboxSlides(slides);
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
                openPhotosTab={openPhotosTab}
                isOwner={isOwner}
                onProfileUpdate={(updated) => setProfile(updated)}
                editing={editingProfile}
                onEditClick={() => setEditingProfile((prev) => !prev)}
              />
            </Grid>

            {/* Main section */}
            <Grid item xs={12} md={6}>
              {isOwner && profile && (
                <Box mb={2}>
                  <CreatePostSection
                    profile={profile}
                    accessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                    userId={userId}
                  />
                </Box>
              )}
              <PinsSection
                pins={pins}
                setPins={setPins}
                profile={profile}
                bgRef={bgRef}
                savedPins={savedPins}
                beenTherePins={beenTherePins}
                wantToGoPins={wantToGoPins}
                saveBeenThere={toggleBeenThere}
                removeBeenThere={toggleBeenThere}
                saveWantToGo={toggleWantToGo}
                removeWantToGo={toggleWantToGo}
                loadingPins={loadingPins}
                onSaveClick={handleSaveClick}
                openLightbox={(slides, idx) => {
                  setLightboxSlides(slides);
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
                onEditClick={handleEditClick}
                isOwner={isOwner}
              />
            </Grid>

            {/* Right sidebar (Edit Profile, only visible if editing) */}
            <Grid item xs={12} md={3}>
              {isOwner && editingProfile ? (
                <EditProfileCard
                  profile={profile}
                  onProfileUpdate={(updated) => setProfile(updated)}
                  onEditClick={() => setEditingProfile(false)}
                />
              ) : null}
            </Grid>
          </Grid>
        )}
      </MDBox>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        plugins={[Zoom]}
      />
      <ListDialog
        open={listDialogOpen}
        pin={dialogPin}
        onSaved={handleDialogSaved}
        onClose={() => setListDialogOpen(false)}
      />
      <InfoEditorDialog
        open={editorOpen}
        value={editingText}
        onChange={setEditingText}
        onClose={handleEditorSave}
      />

      <Footer />
    </DashboardLayout>
  );
}
