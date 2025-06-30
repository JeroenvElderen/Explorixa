import React from "react";
import MDBox from "../../components/MDBox";
import ProfileInfoCard from "../../examples/Cards/InfoCards/ProfileInfoCard";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

export default function ProfilePopup({ user, onClose }) {
  if (!user) return null;
  console.log("ProfilePopup rendered!", user);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 9999, cursor: 'pointer', pointerEvents: 'none',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          minWidth: '320px',
          maxWidth: '90vw',
          background: '#171b2a',
          borderRadius: 14,
          padding: 30,
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          cursor: 'default',
        }}
      >
        <MDBox width="300px">
          <ProfileInfoCard
            title="User Snapshot"
            description={user.description || user.bio || ""}
            info={{
              fullName: user.full_name || user.name || "",
              email: user.email || "",
              location: user.locationName || "",
            }}
            social={[
              {
                link: user.facebook_url || "",
                icon: <FacebookIcon />,
                color: "facebook",
              },
              {
                link: user.twitter_url || "",
                icon: <TwitterIcon />,
                color: "twitter",
              },
              {
                link: user.instagram_url || "",
                icon: <InstagramIcon />,
                color: "instagram",
              },
            ]}
            action={{
              route: `/profile/${user.id}`,
              tooltip: "View Full Profile",
            }}
            shadow={false}
          />
        </MDBox>
      </div>
    </div>
  );
}
