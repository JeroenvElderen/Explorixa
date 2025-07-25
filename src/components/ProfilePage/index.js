// src/components/ProfilePage.jsx
import React, { useEffect, useState } from "react";
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
import ProfileNavTabs from "./ProfileNavTabs";
import PhotoGalleryGrid from "./PhotoGalleryGrid";

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
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

  const [selectedTab, setSelectedTab] = useState("posts");


  const navItems = [
    { key: "posts", label: "Posts" },
    { key: "photos", label: "Photos" },
  ]

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
    supabase
      .from("profiles")
      .select(
        "user_id, Username, full_name, email, location, avatar_url, description, from_location"
      )
      .eq("user_id", userId)
      .single()
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setProfile(data);
      })
      .finally(() => setLoadingProfile(false));
  }, [userId]);

  // Fetch pins & latestPhotos
  useEffect(() => {
    supabase
      .from("pins")
      .select(
        'id, Name, "Main Image", created_at, been_there, want_to_go, saved_count, Information, Images'
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

  return (
    <DashboardLayout>
      <SimpleResponsiveNavbar />
      <StarField />
      <MDBox px={2} py={4} maxWidth="100vw" mx="auto">
        <ProfileHeader 
        profile={profile} 
        loading={loadingProfile} 
        items={navItems}
        onSelect={setSelectedTab}
        />
        {selectedTab === "photos" ? (
  <PhotoGalleryGrid
    photos={latestPhotos}
    openLightbox={(slides, idx) => {
      setLightboxSlides(slides);
      setLightboxIndex(idx);
      setLightboxOpen(true);
    }}
  />
) : (
  <Grid container spacing={3}>
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
    />
    <PinsSection
      pins={pins}
      profile={profile}
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
    />
  </Grid>
)}

      </MDBox>
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        plugins={[Thumbnails, Zoom]}
      />
      <ListDialog
        open={listDialogOpen}
        pin={dialogPin}
        onSaved={handleDialogSaved}
        onClose={() => setListDialogOpen(false)}
      />
      <Footer />
    </DashboardLayout>
  );
}
