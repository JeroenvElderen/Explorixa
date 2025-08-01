import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import { useMaterialUIController } from "context";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { getCountriesByContinent } from "utils/continentHelpers";
import * as emojiFlags from "emoji-flags";

export default function ProjectsContinent({ continent }) {
  const [expanded, setExpanded] = useState(false);
  const [countries, setCountries] = useState([]);
  const theme = useTheme();
  const [controller] = useMaterialUIController();
  const navigate = useNavigate();

  useEffect(() => {
    setCountries(getCountriesByContinent(continent));
  }, [continent]);

  const toggle = () => setExpanded((v) => !v);

  const getFlag = (countryName) => {
    const flag = emojiFlags.data.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase()
    );
    return flag ? flag.emoji : "🌍";
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
    >
      <Card
        sx={{
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          background: "linear-gradient(145deg, rgba(255,255,255,0.17) 0%, rgba(241,143,1,0.09) 100%)",
          border: "1.5px solid rgba(243, 143, 1, 0.32)",
          boxShadow:
            "inset 3px 3px 10px rgba(0,0,0,0.10), 0 6px 16px rgba(241,143,1,0.08), 0 2px 4px rgba(0,0,0,0.10)",
          borderRadius: "24px",
          overflow: "visible",
        }}
      >
        {/* Header */}
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={3}
          onClick={toggle}
          sx={{
            cursor: "pointer",
            borderRadius: "inherit",
            transition: "background 0.2s",
            "&:hover": {
              background: "rgba(241,143,1,0.11)",
            },
          }}
        >
          <MDBox display="flex" alignItems="center" gap={1}>
            <motion.div
              animate={{ rotate: expanded ? 6 : 0, scale: expanded ? 1.15 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
            >
              <Icon sx={{ color: theme.palette.info.main, mt: -0.5, fontSize: 28 }}>public</Icon>
            </motion.div>
            <MDTypography variant="h6" fontWeight="bold">
              Countries in {continent}
            </MDTypography>
          </MDBox>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <Icon fontSize="large">{expanded ? "expand_less" : "expand_more"}</Icon>
          </motion.div>
        </MDBox>

        {/* Collapsible list - no scroll, grows to fit all */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { height: "auto", opacity: 1 },
                collapsed: { height: 0, opacity: 0 },
              }}
              style={{ overflow: "hidden" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Divider />
              <MDBox
                px={2}
                pb={2}
                pt={1}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                  gap: 1.5,
                  // Removed maxHeight and overflowY
                  position: "relative",
                }}
              >
                {countries.length > 0 ? (
                  countries.map((name) => (
                    <motion.div
                      key={name}
                      whileHover={{
                        scale: 1.065,
                        backgroundColor: "rgba(241,143,1,0.17)",
                        boxShadow: "0 3px 18px rgba(241,143,1,0.13)",
                      }}
                      style={{
                        borderRadius: 14,
                        cursor: "pointer",
                        padding: "0.8em 0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 9,
                        transition: "background 0.25s",
                        fontWeight: 500,
                      }}
                      onClick={() =>
                        navigate(
                          `/Destinations/${encodeURIComponent(continent)}/${encodeURIComponent(
                            name
                          )}`
                        )
                      }
                    >
                      <span style={{ fontSize: 22, marginRight: 4 }}>{getFlag(name)}</span>
                      <MDTypography variant="body2" sx={{ textAlign: "center" }}>
                        {name}
                      </MDTypography>
                    </motion.div>
                  ))
                ) : (
                  <MDTypography color="text">No countries found.</MDTypography>
                )}
              </MDBox>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
