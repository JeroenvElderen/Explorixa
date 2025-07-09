// src/layouts/profile/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../../SupabaseClient";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import MDAvatar from "../../../../components/MDAvatar";
import breakpoints from "../../../../assets/theme/base/breakpoints";
import backgroundImage from "../../../../assets/images/bg-profile.jpeg";
import AddIcon from "@mui/icons-material/Add";

function Header({ children, activeTab, onTabChange, avatarUrl, onAvatarChange, backgroundUrl }) {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(activeTab);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTabValue(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => {
      setTabsOrientation(
        window.innerWidth < breakpoints.values.sm ? "vertical" : "horizontal"
      );
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("Username, full_name, avatar_url, user_id")
        .eq("user_id", user.id)
        .single();
      if (data) setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleTabChange = (_, value) => {
    setTabValue(value);
    onTabChange(value);
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const ext = file.name.split('.').pop();
    const path = `${profile.user_id}/avatar.${ext}`;
    await supabase.storage.from('pins-images').upload(path, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from('pins-images').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', profile.user_id);
    onAvatarChange(publicUrl);
  };

  if (loading) return <MDBox p={4}><MDTypography>Loading…</MDTypography></MDBox>;
  if (!profile) return <MDBox p={4}><MDTypography color="error">Profile not found.</MDTypography></MDBox>;

  return (
    <MDBox position="relative" mb={5} >
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(rgba(gradients.info.main, 0.6), rgba(gradients.info.state, 0.6))}, url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: '50%',
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
          // Glass-metal styling:
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow:
            "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
          borderRadius: "12px",
          overflow: "hidden",
        }}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
            />
            <MDBox position="relative" display="inline-block">
              <MDAvatar
                src={avatarUrl || profile.avatar_url}
                alt="profile-image"
                size="xl"
                shadow="sm"
                onClick={triggerFileSelect}
                sx={{
                  cursor: 'pointer',
                  '& .MuiAvatar-img': {
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                  },
                }}
              />
              {tabValue === 2 && (
                <MDBox
                  onClick={triggerFileSelect}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <AddIcon sx={{ color: '#F18F01', fontSize: '48px !important' }} />
                </MDBox>
              )}
            </MDBox>
          </Grid>
          <Grid item>
            <MDTypography variant="h5" fontWeight="medium">
              {profile.Username}
            </MDTypography>
            <MDTypography variant="button" color="text">
              {profile.Username}'s Dashboard
            </MDTypography>
          </Grid>
          <Grid item xs={12} md={6} lg={4} sx={{ ml: 'auto' }}>
            <AppBar position="static" >
              <Tabs orientation={tabsOrientation} value={tabValue} onChange={handleTabChange}
                TabIndicatorProps={{
                  sx: { backgroundColor: "#F18F01" }
                }}
                sx={{
                  p: 2,
                  width: "100%",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  background:
                    "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow:
                    "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
                  borderRadius: "12px",
                }} >
                <Tab label="App" icon={<Icon>home</Icon>} value={0} />
                <Tab label="Message" icon={<Icon>email</Icon>} value={1} />
                <Tab label="Settings" icon={<Icon>settings</Icon>} value={2} />
              </Tabs>
            </AppBar>
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}
Header.propTypes = {
  children: PropTypes.node,
  activeTab: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
  avatarUrl: PropTypes.string,
  onAvatarChange: PropTypes.func.isRequired,
};
Header.defaultProps = { avatarUrl: '' };
export default Header;
