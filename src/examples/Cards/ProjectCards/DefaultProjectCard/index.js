// src/examples/Cards/ProjectCards/DefaultProjectCard.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import MDButton from "../../../../components/MDButton";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../../../../SupabaseClient";

/**
 * Fetches the current user's pins from Supabase and displays them as cards,
 * with a delete button on each.
 */

export default function DefaultProjectCard({ height = "300px" }) {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // load pins
  useEffect(() => {
    async function fetchPins() {
      setLoading(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setError(authError || new Error("No user logged in"));
        setPins([]);
        setLoading(false);
        return;
      }
      const { data: pinsData, error: pinsError } = await supabase
        .from("pins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (pinsError) {
        console.error(pinsError);
        setError(pinsError);
        setPins([]);
      } else {
        setPins(pinsData || []);
      }
      setLoading(false);
    }
    fetchPins();
  }, []);

  // delete a pin
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pin?")) return;
    const { error: deleteError } = await supabase
      .from("pins")
      .delete()
      .eq("id", id);
    if (deleteError) {
      console.error(deleteError);
      alert("Failed to delete pin");
    } else {
      // remove from UI
      setPins((prev) => prev.filter((pin) => pin.id !== id));
    }
  };

  if (loading) {
    return <MDTypography>Loading pins…</MDTypography>;
  }
  if (error) {
    return <MDTypography color="error">Error loading pins: {error.message}</MDTypography>;
  }
  if (pins.length === 0) {
    return <MDTypography>No pins found.</MDTypography>;
  }

  return (
    <MDBox 
      component="div"
      sx={{
        display: "flex",
        gap: 2,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        px: 2,
        "&::-webkit-scrollbar": {display : "none" },
      }}
    >
      {pins.map((pin) => (
        <Card
          key={pin.id}
          sx={{
            minWidth: "250px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            height,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background: "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow:
              "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
            borderRadius: "12px",
            overflow: "hidden",
            scrollSnapAlign: "start",
          }}
        >
          <MDBox
            sx={{
              height: `calc(${height} * 0.6)`,
              width: "100%",
              backgroundImage: `url(${pin["Main Image"]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <MDBox p={2} sx={{ flexGrow: 1, textAlign: "center" }}>
            <MDTypography variant="h6" fontWeight="bold">
              {pin.Name}
            </MDTypography>
            <MDTypography variant="caption" sx={{ display: "block", mb: 1 }}>
              {new Date(pin.created_at).toLocaleDateString()}
            </MDTypography>
            <MDBox
              sx={{
                overflowY: "auto",
                maxHeight: `calc(${height} * 0.2)`,
                mb: 2,
              }}
            >
              <MDTypography variant="body2">{pin.Information}</MDTypography>
            </MDBox>
          </MDBox>
          <MDBox
            sx={{
              px: 2,
              pb: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <MDButton
              component={Link}
              to={`/pins/${pin.id}`}
              variant="outlined"
              size="small"
              color="info"
            >
              View Pin
            </MDButton>
            <IconButton
              onClick={() => handleDelete(pin.id)}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </MDBox>
        </Card>
      ))}
    </MDBox>
  );
}

DefaultProjectCard.propTypes = {
  height: PropTypes.string,
};

DefaultProjectCard.defaultProps = {
  height: "300px",
};
