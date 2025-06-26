import { useState, useEffect } from "react";

// @mui components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import { useMaterialUIController } from "context";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Supabase client
import { supabase } from "SupabaseClient";

// React markdown
import ReactMarkdown from "react-markdown";

import DiffMatchPatch from "diff-match-patch";

const highlightChanges = (oldText, newText) => {
  const dmp = new DiffMatchPatch();
  const diff = dmp.diff_main(oldText || "", newText || "");
  dmp.diff_cleanupSemantic(diff);
  return diff
    .map(([op, data]) => {
      if (op === 1) return `<span style="background-color: #d4edda">${data}</span>`;
      if (op === -1) return `<del style="color: red;">${data}</del>`;
      return data;
    })
    .join("");
};

// NEW: Extract only changed lines from newText (and optionally oldText)
const getChangedLines = (oldText, newText) => {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(oldText || "", newText || "");
  dmp.diff_cleanupSemantic(diffs);

  const changedLineIndices = new Set();
  let oldLineIndex = 0;
  let newLineIndex = 0;

  const oldLines = (oldText || "").split("\n");
  const newLines = (newText || "").split("\n");

  diffs.forEach(([op, data]) => {
    const lines = data.split("\n");

    if (op === 0) {
      oldLineIndex += lines.length - 1;
      newLineIndex += lines.length - 1;
    } else if (op === -1) {
      for (let i = 0; i < lines.length; i++) {
        changedLineIndices.add(`old:${oldLineIndex + i}`);
      }
      oldLineIndex += lines.length - 1;
    } else if (op === 1) {
      for (let i = 0; i < lines.length; i++) {
        changedLineIndices.add(`new:${newLineIndex + i}`);
      }
      newLineIndex += lines.length - 1;
    }
  });

  // Collect changed lines from new text only (you can add old lines if desired)
  const changedLines = [];
  changedLineIndices.forEach((lineId) => {
    const [type, idxStr] = lineId.split(":");
    const idx = parseInt(idxStr, 10);
    if (type === "new") {
      if (newLines[idx]) changedLines.push(newLines[idx]);
    }
    // To also show old lines (deleted), uncomment below:
    // else if (type === "old") {
    //   if (oldLines[idx]) changedLines.push(`- ${oldLines[idx]}`);
    // }
  });

  return changedLines.join("\n");
};

// Insert pending update into Supabase
const addPendingUpdate = async ({ country, field, oldText, newText }) => {
  // Create highlighted oldText with diffs (old text + deletions highlighted)
  const highlightedOldText = highlightChanges(oldText, newText);

  const { data, error } = await supabase
    .from("pending_updates")
    .insert([
      { 
        country, 
        field, 
        old_text: oldText,  // <-- save highlighted HTML here
        new_text: highlightedOldText 
      }
    ]);

  if (error) {
    console.error("Failed to add pending update:", error);
  } else {
    console.log("Pending update added:", data);
  }
};


function Projects({ country }) {
  const [expandedCard, setExpandedCard] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const theme = useTheme();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState({});

  const toggleCard = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  // Fetch pending updates for the current country
  const fetchPendingUpdates = async (countryName) => {
    const { data, error } = await supabase
      .from("pending_updates")
      .select()
      .eq("country", countryName)
      .eq("status", "pending"); // adjust if your table differs

    if (error) {
      console.error("Error fetching pending updates:", error);
    } else {
      setPendingUpdates(data);
    }
  };

  useEffect(() => {
  if (!country) return;

  fetchCountryInfo(country);
  fetchPendingUpdates(country);

  const channel = supabase
    .channel('pending_updates_channel')
    .on(
      'postgres_changes',
      {
        event: '*', // listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'pending_updates',
        filter: `country=eq.${country}`,
      },
      (payload) => {
        console.log('Change received!', payload);
        fetchPendingUpdates(country);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [country]);



  const fetchCountryInfo = async (countryName) => {
    const { data, error } = await supabase
      .from("countries")
      .select("name, country_info, moving_info, animal_info")
      .eq("name", countryName)
      .maybeSingle();

    if (error) {
      console.error("Error fetching country data:", error);
    } else {
      setCountryData(data);
    }
  };

  const dropdownCards = [
    {
      title: "Country Info",
      key: "country_info",
    },
    {
      title: "Moving Info",
      key: "moving_info",
    },
    {
      title: "Animal Info",
      key: "animal_info",
    },
  ];

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            {countryData?.name || "Loading..."}
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon
              sx={{
                fontWeight: "bold",
                color: ({ palette: { info } }) => info.main,
                mt: -0.5,
              }}
            >
              public
            </Icon>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>Details for this country</strong>
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      <MDBox px={2} pb={2}>
        {dropdownCards.map((card, index) => {
          const isPending = pendingUpdates.some(
            (update) => update.field === card.key && update.status === "pending"
          );

          return (
            <Card
              key={index}
              sx={{
                mb: 2,
                cursor: "pointer",
                boxShadow: `0 0 10px 0 ${
                  theme.palette[sidenavColor]?.main || theme.palette.primary.main
                }66`,
              }}
              onClick={() => toggleCard(index)}
            >
              <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography
                  variant="subtitle1"
                  fontWeight="medium"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  {card.title}
                  {isPending && (
                    <MDTypography
                      variant="caption"
                      color="warning"
                      sx={{
                        fontWeight: "bold",
                        ml: 1,
                        backgroundColor: "#fff3cd",
                        px: 1,
                        borderRadius: 1,
                      }}
                    >
                      Pending update
                    </MDTypography>
                  )}
                </MDTypography>
                <Icon>{expandedCard === index ? "expand_less" : "expand_more"}</Icon>
              </MDBox>
              <Collapse in={expandedCard === index} timeout="auto" unmountOnExit>
                <MDBox px={2} pb={2}>
                  {countryData ? (
                    <>
                      <ReactMarkdown
                        children={countryData[card.key] || "No data available"}
                        components={{
                          h1: ({ node, ...props }) => (
                            <MDTypography variant="h4" gutterBottom {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <MDTypography variant="h5" gutterBottom {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <MDTypography variant="h6" gutterBottom {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <MDTypography variant="body1" paragraph {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <MDTypography component="li" sx={{ ml: 2 }} {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <MDBox component="ul" sx={{ pl: 3, mb: 2 }} {...props} />
                          ),
                          a: ({ node, ...props }) => (
                            <MDTypography
                              component="a"
                              sx={{ color: "primary.main", textDecoration: "underline" }}
                              {...props}
                            />
                          ),
                        }}
                      />
                      {isEditing === index ? (
                        <>
                          <textarea
                            style={{ width: "100%", height: "150px", marginTop: "1rem" }}
                            value={editedText[card.key] || ""}
                            onChange={(e) =>
                              setEditedText({ ...editedText, [card.key]: e.target.value })
                            }
                            onClick={(e) => e.stopPropagation()} // prevent collapse close on textarea click
                          />
                          <MDBox display="flex" gap={1} mt={1}>
                            <Button
                              variant="contained"
                              color="success"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await addPendingUpdate({
                                  country: countryData.name,
                                  field: card.key,
                                  oldText: countryData[card.key],
                                  newText: getChangedLines(countryData[card.key], editedText[card.key]),
                                });
                                setIsEditing(false);
                                alert("Submitted for approval!");
                                fetchPendingUpdates(countryData.name);
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </MDBox>
                        </>
                      ) : (
                        !isPending && (
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(index);
                            setEditedText({ ...editedText, [card.key]: countryData[card.key] });
                          }}
                        >
                          Request update
                        </Button>
                        )
                      )}
                    </>
                  ) : (
                    <MDTypography variant="body2" color="text">
                      Loading...
                    </MDTypography>
                  )}
                </MDBox>
              </Collapse>
            </Card>
          );
        })}
      </MDBox>
    </Card>
  );
}

export default Projects;
