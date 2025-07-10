import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import { useMaterialUIController } from "context";
import { getCountriesByContinent } from "utils/continentHelpers";
import Divider from "@mui/material/Divider";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Supabase client
import { supabase } from "SupabaseClient";


export default function ProjectsContinent({ continent }) {
  const [expanded, setExpanded] = useState(false);
  const [countries, setCountries] = useState([]);
  const theme = useTheme();
  const [controller] = useMaterialUIController();
  const navigate = useNavigate();

  // 1) load all country names for this continent
  useEffect(() => {
    setCountries(getCountriesByContinent(continent));
  }, [continent]);

  const toggle = () => setExpanded((v) => !v);

  return (
    <Card
      sx={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
        border: "1px solid rgba(243, 143, 1, 0.6)",
        boxShadow:
          "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
        borderRadius: "12px",
      }}
    >
      {/* header */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3} onClick={toggle} sx={{cursor: 'pointer' }}>
        <MDBox>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon sx={{ color: theme.palette.info.main, mt: -0.5 }}>public</Icon>
            <MDTypography variant="h6">
              &nbsp;<strong>Countries in {continent}</strong>
            </MDTypography>
          </MDBox>
        </MDBox>
        <Icon>
          {expanded ? "expand_less" : "expand_more"}
        </Icon>
      </MDBox>

      {/* collapsible country list */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
      <Divider />
        <MDBox px={2} pb={2}
        sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
        }}>
          {countries.length > 0 ? (
            countries.map((name) => (
              <MDBox
                key={name}
                onClick={() =>
                  navigate(
                    `/Destinations/World_destinations/${encodeURIComponent(
                      continent
                    )}/${encodeURIComponent(name)}`
                  )
                }
                sx={{
                  mb: 1,
                  width: '20vw',
                  height: '3vh',
                  borderRadius: '12px',
                  alignItems: 'center',
                  
                  "&:hover": {
                    background: "rgba(241,143,1,0.5)",
                    cursor: "pointer",
                  },
                }}
              >
                
                <MDTypography variant="body2" sx={{textAlign: 'center'}}>{name}</MDTypography>
              </MDBox>
            ))
          ) : (
            <MDTypography color="text">No countries found.</MDTypography>
          )}
        </MDBox>
      </Collapse>
    </Card>
  );
}
