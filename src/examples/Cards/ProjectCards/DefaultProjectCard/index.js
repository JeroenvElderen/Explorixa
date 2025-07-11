// src/examples/Cards/ProjectCards/DefaultProjectCard.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import MDButton from "../../../../components/MDButton";
import { supabase } from "../../../../SupabaseClient";
import "react-quill/dist/quill.bubble.css";
import "quill/dist/quill.core.css";
import "quill/dist/quill.bubble.css";
import { useSavedPins } from "../../../../components/SavedPinsContext";


/**
 * Fetches the current user's pins plus all countries, then
 * displays each pin with a "View Pin" link to the dynamic
 * route /Destinations/:continent/:country/:pinSlug.
 */

// 1) Safe sluggify: coerce null/undefined to ""
const sluggify = (input) => {
  const str = input != null ? String(input) : "";
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w-]/g, "");
};

export default function DefaultProjectCard({ height = "300px" }) {
  const [pins, setPins]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  
  const { remove, removeBeenThere, removeWantToGo } = useSavedPins();

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);

      // 1) Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        if (active) {
          setError(authError || new Error("No user logged in"));
          setLoading(false);
        }
        return;
      }

      // 2) Fetch this user's pins
      const { data: pinsData, error: pinsError } = await supabase
        .from("pins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (pinsError) {
        if (active) {
          console.error(pinsError);
          setError(pinsError);
          setLoading(false);
        }
        return;
      }

      // 3) Fetch all countries (assumes lowercase `name` + `continent`)
      const { data: countriesData, error: countriesError } = await supabase
        .from("countries")
        .select("name, continent");
      if (countriesError) {
        if (active) {
          console.error(countriesError);
          setError(countriesError);
          setLoading(false);
        }
        return;
      }

      // 4) Build lookup: countryNameLower → continent
      const continentByCountry = new Map(
        (countriesData || []).map((c) => [
          (c.name || "").toLowerCase(),
          c.continent,
        ])
      );

      // 5) Attach continent onto each pin
      const merged = (pinsData || []).map((pin) => {
        const key = (pin.countryName || "").toLowerCase();
        return {
          ...pin,
          continent: continentByCountry.get(key) || null,
        };
      });

      if (active) {
        setPins(merged);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

   // deletes the pin row (with cascade) then removes it locally
 const handleDeletePin = async (pin) => {
   if (!window.confirm("Delete this pin?")) return;
   // 1. Delete the pin row; ON DELETE CASCADE in Postgres will remove all list_pins entries
   const { error } = await supabase
     .from("pins")
     .delete()
     .eq("id", pin.id);
   if (error) {
     console.error("Error deleting pin:", error);
     alert("Failed to delete pin");
     return;
   }
   // 2. Remove locally so your UI updates immediately
   setPins((prev) => prev.filter((p) => p.id !== pin.id));

   // 3. scrub it out of saved pins lists
   remove(pin);
   removeBeenThere(pin);
   removeWantToGo(pin);
 };

  if (loading) return <MDTypography>Loading pins…</MDTypography>;
  if (error)   return <MDTypography color="error">Error: {error.message}</MDTypography>;
  if (!pins.length) return <MDTypography>No pins found.</MDTypography>;

  return (
    <MDBox
      component="div"
      sx={{
        display: "flex",
        gap: 2,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        px: 2,
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {pins.map((pin) => {
        const { continent, countryName, Name, created_at } = pin;
        const hasRoute = Boolean(continent && countryName && Name);

        // 2) Slugify safely (won't crash if any are null)
        const contSlug = sluggify(continent);
        const counSlug = sluggify(countryName);
        const pinSlug  = sluggify(Name);

        const to = `/Destinations/${contSlug}/${counSlug}/${pinSlug}`;

        return (
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
              background:
                "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              boxShadow:
                "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
              borderRadius: "12px",
              overflow: "hidden",
              scrollSnapAlign: "start",
            }}
          >
            {/* Image */}
            <MDBox
              sx={{
                height: `calc(${height} * 0.6)`,
                width: "100%",
                backgroundImage: `url(${pin["Main Image"]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Title & Date */}
            <MDBox p={2} sx={{ flexGrow: 1, textAlign: "center" }}>
              <MDTypography variant="h6" fontWeight="bold">
                {Name}
              </MDTypography>
              <MDTypography variant="caption" sx={{ display: "block", mb: 1 }}>
                {new Date(created_at).toLocaleDateString()}
              </MDTypography>
            </MDBox>

            {/* Actions */}
            <MDBox
              sx={{
                px: 2,
                pb: 2,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {hasRoute ? (
                <MDButton
                  component={Link}
                  to={to}
                  state={{ pin }}
                  variant="outlined"
                  size="small"
                  color="info"
                >
                  View Pin
                </MDButton>
              ) : (
                <MDButton disabled variant="outlined" size="small" color="info">
                  No Route
                </MDButton>
              )}

              <IconButton
                onClick={() => handleDeletePin(pin)}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </MDBox>
          </Card>
        );
      })}
    </MDBox>
  );
}

DefaultProjectCard.propTypes = {
  height: PropTypes.string,
};

DefaultProjectCard.defaultProps = {
  height: "300px",
};
