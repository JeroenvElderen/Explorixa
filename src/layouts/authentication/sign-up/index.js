import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import { grey } from "@mui/material/colors";

import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import MDInput from "../../../components/MDInput";
import MDButton from "../../../components/MDButton";

import CoverLayout from "../../../layouts/authentication/components/CoverLayout";
import BasicLayout from "../components/BasicLayout";
import bgImage from "../../../assets/images/bg-sign-up-cover.jpeg";
import { supabase } from "../../../SupabaseClient"; // adjust path as needed

function Cover() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!agreeTerms) {
      setErrorMessage("You must agree to the Terms and Conditions.");
      return;
    }

    setLoading(true);

    // Supabase sign up with email & password
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name, // store the name in user_metadata
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Sign up successful! Please check your email to confirm.");
      setName("");
      setEmail("");
      setPassword("");
      setAgreeTerms(false);
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
        }}
      >
        <MDBox
          variant="contained"
          mx={2}
          mt={-3}
          p={3}
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
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Name"
                variant="standard"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                variant="standard"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </MDBox>
            {/* 
            <MDBox display="flex" alignItems="center" ml={-1} mb={2}>
              <Checkbox
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
                sx={{
                  // unchecked icon color:
                  color: grey[500],
                  // checked icon color:
                  "&.MuiCheckbox-colorPrimary.Mui-checked .MuiSvgIcon-root": {
                    color: "rgba(241,143,1,1)",
                    background: "rgba(241,143,1,0.5) !important",
                    borderColor: "rgba(241,143,1,0.5) !important"
                  },
                }}
              />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1, width: 1 }}
                onClick={() => setAgreeTerms(!agreeTerms)}
              >
                &nbsp;&nbsp;I agree to the&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                sx={{
                  color: "#F18F01"
                }}
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            */}

            {errorMessage && (
              <MDTypography color="error" variant="body2" mb={2}>
                {errorMessage}
              </MDTypography>
            )}
            {successMessage && (
              <MDTypography color="success" variant="body2" mb={2}>
                {successMessage}
              </MDTypography>
            )}

            <MDBox mt={4} mb={1}
            >
              <MDButton
                variant="contained"
                color="info"
                fullWidth
                type="submit"
                disabled={loading}
                sx={{
                  background: "#F18F01 !important"
                }}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </MDButton>
            </MDBox>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  fontWeight="medium"
                  sx={{
                    color: "#F18F01"
                  }}
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Cover;
