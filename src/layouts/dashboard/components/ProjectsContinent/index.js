// components/continent/ProjectsContinent.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { getCountriesByContinent } from "utils/continentHelpers";
import * as emojiFlags from "emoji-flags";

export default function ProjectsContinent({ continent }) {
  const [expanded, setExpanded] = useState(false);
  const [countries, setCountries] = useState([]);
  const theme = useTheme();
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.7 }}
    >
      <Card
        sx={{
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.19) 0%, rgba(241,143,1,0.13) 100%)",
          border: "1.5px solid rgba(243, 143, 1, 0.22)",
          boxShadow: "0 6px 18px rgba(241,143,1,0.08), 0 2px 4px rgba(0,0,0,0.11)",
          borderRadius: "24px",
        }}
      >
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={3}
          onClick={toggle}
          sx={{
            cursor: "pointer",
            borderRadius: "inherit",
            transition: "background 0.18s",
            "&:hover": {
              background: "rgba(241,143,1,0.09)",
            },
          }}
        >
          <MDBox display="flex" alignItems="center" gap={1}>
            <motion.div
              animate={{ rotate: expanded ? 6 : 0, scale: expanded ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
            >
              <Icon
                sx={{ color: theme.palette.info.main, mt: -0.5, fontSize: 28 }}
              >
                public
              </Icon>
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

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ maxHeight: 0, opacity: 0 }}
              animate={{ maxHeight: 1000, opacity: 1 }}
              exit={{ maxHeight: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              style={{ overflow: "hidden", willChange: "max-height, opacity" }}
            >
              <Divider />
              <MDBox
                px={2}
                pb={2}
                pt={1}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 1.5,
                  position: "relative",
                }}
              >
                {countries.length > 0 ? (
                  countries.map((name) => (
                    <motion.div
                      key={name}
                      whileHover={{
                        scale: 1.055,
                        backgroundColor: "rgba(241,143,1,0.17)",
                        boxShadow: "0 3px 14px rgba(241,143,1,0.13)",
                      }}
                      style={{
                        borderRadius: 14,
                        cursor: "pointer",
                        padding: "0.8em 0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 9,
                        transition: "background 0.22s",
                        fontWeight: 500,
                      }}
                      onClick={() =>
                        navigate(
                          `/Destinations/${encodeURIComponent(
                            continent
                          )}/${encodeURIComponent(name)}`
                        )
                      }
                    >
                      <span style={{ fontSize: 22, marginRight: 4 }}>
                        {getFlag(name)}
                      </span>
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
