// src/layouts/profile/components/Header.styles.js
import backgroundImage from "../../../assets/images/bg-profile.jpeg";

export const cardBase = {
  position: "relative",
  mt: -8,
  mx: 3,
  py: 2,
  px: 2,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
  border: "1px solid rgba(255,255,255,0.6)",
  boxShadow:
    "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
  borderRadius: "12px",
  overflow: "hidden",
};

export const avatarBase = {
  cursor: "pointer",
  "& .MuiAvatar-img": {
    objectFit: "cover",
    width: "100%",
    height: "100%",
  },
};
