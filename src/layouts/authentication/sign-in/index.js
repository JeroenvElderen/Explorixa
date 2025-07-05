import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";

import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import MDInput from "../../../components/MDInput";
import MDButton from "../../../components/MDButton";

import BasicLayout from "../../../layouts/authentication/components/BasicLayout";

import bgImage from "../../../assets/images/bg-sign-in-basic.jpeg";
import { supabase } from "../../../SupabaseClient"; // Adjust path as needed

function Basic() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    // Supabase sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      // You can store user data or tokens here if needed
      // Optionally, redirect user after login
      navigate("/dashboard"); // Change this route as needed
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          p: 2,
          borderRadius: 2,
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(243,143,1,0.6)",
        }}>
        <MDBox
          variant="contained"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
          sx={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background:
              "linear-gradient(0deg, rgba(241,143,1,0.5) 0%, rgba(241,143,1,1) 100%) !important",
            border: "1px solid rgba(241, 143, 1, 0.6)",
            boxShadow:
              "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
            borderRadius: "12px",
            overflow: "auto",
          }}
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            {/* <Grid item xs={2}>
             <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid> */}
            {/* <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GitHubIcon color="inherit" />
              </MDTypography>
            </Grid> */}
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GoogleIcon color="inherit" />
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputLabelProps={{
                  sx: {
                    color: "white",
                    "&.Mui-focused": {
                      color: "white !important",
                    }
                  }
                }}
                sx={{
                  // target the root OutlinedInput element
                  "& .MuiOutlinedInput-root": {
                    // default (unfocused) state
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#F18F01",
                      color: "white !important"
                    },
                    // hover state
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#D37500",
                      color: "white !important",
                    },
                    // focused state
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#F18F01",
                      color: "white !important"
                    },
                  },
                }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputLabelProps={{
                  sx: {
                    color: "white",
                    "&.Mui-focused": {
                      color: "white !important",
                    }
                  }
                }}
                sx={{
                  // target the root OutlinedInput element
                  "& .MuiOutlinedInput-root": {
                    // default (unfocused) state
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#F18F01",
                      color: "white !important"
                    },
                    // hover state
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#D37500",
                      color: "white !important",
                    },
                    // focused state
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#F18F01",
                      color: "white !important"
                    },
                  },
                }}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch 
              checked={rememberMe} 
              onChange={handleSetRememberMe}
                sx={{
    // Thumb color when checked
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: "#F18F01",
      // Hover/active state on the thumb
      "&:hover": {
        backgroundColor: "rgba(241,143,1,0.08)",
      },
    },
    // Track color when checked
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#F18F01 !important",
    },
    // Optional: track transition speed
    "& .MuiSwitch-track": {
      transition: "background-color 300ms ease",
    },
  }} 
  />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>

            {errorMessage && (
              <MDTypography color="error" variant="body2" sx={{ mt: 2 }}>
                {errorMessage}
              </MDTypography>
            )}

            <MDBox mt={4} mb={1}>
              <MDButton
                variant="contained"
                sx={{
                  background: "#F18F01",
                  color: "white !important",
                  transition: "background 0.3s ease",    // smooth transition
                  "&:hover": {
                    background: "#D37500",               // your hover color
                  },
                }}
                fullWidth
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  fontWeight="medium"
                  sx={{
                    color: "#F18F01 !important"
                  }}
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
