import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

import MDBox from "../../components/MDBox";
import MDTypography from "../../components/MDTypography";

import DashboardLayout from "../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../examples/Navbars/DashboardNavbar";
import Footer from "../../examples/Footer";
import ProfileInfoCard from "../../examples/Cards/InfoCards/ProfileInfoCard";
import ProfilesList from "../../examples/Lists/ProfilesList";
import DefaultProjectCard from "../../examples/Cards/ProjectCards/DefaultProjectCard";

import Header from "../../layouts/profile/components/Header";
import PlatformSettings from "../../layouts/profile/components/PlatformSettings";

import profilesListData from "../../layouts/profile/data/profilesListData";

import homeDecor1 from "../../assets/images/home-decor-1.jpg";
import homeDecor2 from "../../assets/images/home-decor-2.jpg";
import homeDecor3 from "../../assets/images/home-decor-3.jpg";
import homeDecor4 from "../../assets/images/home-decor-4.jpeg";

import team1 from "../../assets/images/team-1.jpg";
import team2 from "../../assets/images/team-2.jpg";
import team3 from "../../assets/images/team-3.jpg";
import team4 from "../../assets/images/team-4.jpg";

import { supabase } from "../../SupabaseClient"; // adjust path as needed

function Overview() {
  const [profile, setProfile] = useState(null);

  async function fetchProfile() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("Logged in user:", user, "Error:", userError);

    if (userError || !user) {
      setProfile(null);
      console.error("User not logged in or error:", userError);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)  // Use user_id as primary key
      .maybeSingle();

      console.log("Fetched profile data:", data, "Error:", error);  

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
  }

  useEffect(() => {
    fetchProfile();

    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
  if (subscription?.unsubscribe) {
    subscription.unsubscribe();
  }
};

  }, []);

  if (!profile) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={4}>
          <MDTypography variant="h5" align="center">
            Loading profile...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6} xl={4}>
              <PlatformSettings />
            </Grid>
            <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
              <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
              <ProfileInfoCard
                title="Profile Information"
                description={profile.description || profile.bio || ""}
                info={{
                  fullName: profile.full_name || "",
                  mobile: profile.mobile || "",
                  email: profile.email || "",
                  location: profile.location || "",
                }}
                social={[
                  {
                    link: profile.facebook_url || "",
                    icon: <FacebookIcon />,
                    color: "facebook",
                  },
                  {
                    link: "", // no twitter url in your schema; leave blank or add if needed
                    icon: <TwitterIcon />,
                    color: "twitter",
                  },
                  {
                    link: profile.instagram_url || "",
                    icon: <InstagramIcon />,
                    color: "instagram",
                  },
                ]}
                action={{ route: "", tooltip: "Edit Profile" }}
                shadow={false}
              />
              <Divider orientation="vertical" sx={{ mx: 0 }} />
            </Grid>
            <Grid item xs={12} xl={4}>
              <ProfilesList title="Conversations" profiles={profilesListData} shadow={false} />
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={2} px={2} lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="medium">
            Projects
          </MDTypography>
          <MDBox mb={1}>
            <MDTypography variant="button" color="text">
              Architects design houses
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox p={2}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor1}
                label="project #2"
                title="modern"
                description="As Uber works through a huge amount of internal management turmoil."
                action={{
                  type: "internal",
                  route: "/pages/profile/profile-overview",
                  color: "info",
                  label: "view project",
                }}
                authors={[
                  { image: team1, name: "Elena Morison" },
                  { image: team2, name: "Ryan Milly" },
                  { image: team3, name: "Nick Daniel" },
                  { image: team4, name: "Peterson" },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor2}
                label="project #1"
                title="scandinavian"
                description="Music is something that everyone has their own specific opinion about."
                action={{
                  type: "internal",
                  route: "/pages/profile/profile-overview",
                  color: "info",
                  label: "view project",
                }}
                authors={[
                  { image: team3, name: "Nick Daniel" },
                  { image: team4, name: "Peterson" },
                  { image: team1, name: "Elena Morison" },
                  { image: team2, name: "Ryan Milly" },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor3}
                label="project #3"
                title="minimalist"
                description="Different people have different taste, and various types of music."
                action={{
                  type: "internal",
                  route: "/pages/profile/profile-overview",
                  color: "info",
                  label: "view project",
                }}
                authors={[
                  { image: team4, name: "Peterson" },
                  { image: team3, name: "Nick Daniel" },
                  { image: team2, name: "Ryan Milly" },
                  { image: team1, name: "Elena Morison" },
                ]}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor4}
                label="project #4"
                title="gothic"
                description="Why would anyone pick blue over pink? Pink is obviously a better color."
                action={{
                  type: "internal",
                  route: "/pages/profile/profile-overview",
                  color: "info",
                  label: "view project",
                }}
                authors={[
                  { image: team4, name: "Peterson" },
                  { image: team3, name: "Nick Daniel" },
                  { image: team2, name: "Ryan Milly" },
                  { image: team1, name: "Elena Morison" },
                ]}
              />
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
