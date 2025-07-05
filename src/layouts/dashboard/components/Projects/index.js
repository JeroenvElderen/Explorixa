import { useState, useEffect } from "react";

// @mui components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { useMaterialUIController } from "context";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Supabase client
import { supabase } from "SupabaseClient";

// React Markdown
import ReactMarkdown from "react-markdown";

// Rich text editor
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../../../App.css"

// DiffMatchPatch for highlighting and extracting changes
import DiffMatchPatch from "diff-match-patch";

// Utility: highlight differences inline (for HTML storage)
const highlightChanges = (oldText, newText) => {
  const dmp = new DiffMatchPatch();
  const diff = dmp.diff_main(oldText || "", newText || "");
  dmp.diff_cleanupSemantic(diff);
  return diff
    .map(([op, data]) => {
      if (op === 1) return `<span style=\"background-color: #d4edda\">${data}</span>`;
      if (op === -1) return `<del style=\"color: red;\">${data}</del>`;
      return data;
    })
    .join("");
};

// Utility: extract only changed lines from newText
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

  const changedLines = [];
  changedLineIndices.forEach((lineId) => {
    const [type, idxStr] = lineId.split(":");
    const idx = parseInt(idxStr, 10);
    if (type === "new" && newLines[idx]) {
      changedLines.push(newLines[idx]);
    }
  });

  return changedLines.join("\n");
};

// Insert pending update into Supabase
const addPendingUpdate = async ({ country, field, oldText, htmlContent }) => {
  const { error } = await supabase
    .from("pending_updates")
    .insert([{ country, field, old_text: oldText, new_text: htmlContent }]);
  if (error) console.error("Failed to add pending update:", error);
};

export default function Projects({ country }) {
  const [expandedCard, setExpandedCard] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editedText, setEditedText] = useState("");
  const theme = useTheme();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;

  const dropdownCards = [
    { title: "Country Info", key: "country_info" },
    { title: "Moving Info", key: "moving_info" },
    { title: "Animal Info", key: "animal_info" },
  ];

  const fetchCountryInfo = async (countryName) => {
    const { data, error } = await supabase
      .from("countries")
      .select("name, country_info, moving_info, animal_info")
      .eq("name", countryName)
      .maybeSingle();
    if (!error) setCountryData(data);
  };

  const fetchPendingUpdates = async (countryName) => {
    const { data, error } = await supabase
      .from("pending_updates")
      .select()
      .eq("country", countryName)
      .eq("status", "pending");
    if (!error) setPendingUpdates(data || []);
  };

  useEffect(() => {
    if (!country) return;
    fetchCountryInfo(country);
    fetchPendingUpdates(country);

    const updatesChannel = supabase
      .channel("pending_updates_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pending_updates", filter: `country=eq.${country}` },
        () => fetchPendingUpdates(country)
      )
      .subscribe();

    const countriesChannel = supabase
      .channel("countries_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "countries", filter: `name=eq.${country}` },
        () => fetchCountryInfo(country)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(updatesChannel);
      supabase.removeChannel(countriesChannel);
    };
  }, [country]);

  const toggleCard = (idx) => setExpandedCard(expandedCard === idx ? null : idx);

  const handleOpenEditor = (fieldKey) => {
    setEditingField(fieldKey);
    setEditedText(countryData[fieldKey] || "");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    // Save full Quill HTML into new_text
    await addPendingUpdate({
      country: countryData.name,
      field: editingField,
      oldText: countryData[editingField],
      htmlContent: editedText,
    });
    setIsDialogOpen(false);
    setEditingField(null);
    fetchPendingUpdates(countryData.name);
  };

  return (
    <>
      <Card
        sx={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
          border: "1px solid rgba(243, 143, 1, 0.6)",
          boxShadow:
            "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
          borderRadius: "12px",

          "&::-webkit-scrollbar": { width: 0, height: 0 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "transparent" },

          scrollbarWidth: "none",
          scrollbarColor: "transparent transparent",
          "-ms-overflow-style": "none",
        }}
      >
        <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
          <MDBox>
            <MDTypography variant="h6">{countryData?.name || "Loading..."}</MDTypography>
            <MDBox display="flex" alignItems="center" lineHeight={0}>
              <Icon sx={{ color: theme.palette.info.main, mt: -0.5 }}>public</Icon>
              <MDTypography variant="button">&nbsp;<strong>Details for this country</strong></MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
        <MDBox px={2} pb={2}>
          {dropdownCards.map((card, idx) => {
            const isPending = pendingUpdates.some(u => u.field === card.key);
            return (
              <Card
                key={card.key}
                sx={{
                  mb: 2,
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
                  border: "1px solid rgba(243, 143, 1, 0.6)",
                  boxShadow:
                    "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
                  borderRadius: "12px",
                  "&::-webkit-scrollbar": { width: 0, height: 0 },
                  "&::-webkit-scrollbar-track": { background: "transparent" },
                  "&::-webkit-scrollbar-thumb": { background: "transparent" },
                  scrollbarWidth: "none",
                  scrollbarColor: "transparent transparent",
                  "-ms-overflow-style": "none",
                }}
                onClick={() => toggleCard(idx)}
              >
                <MDBox p={2} display="flex" justifyContent="space-between">
                  <MDTypography variant="subtitle1" fontWeight="medium">
                    {card.title}
                    {isPending && (
                      <MDTypography variant="caption" color="warning" sx={{ ml: 1, backgroundColor: '#fff3cd', px: 1, borderRadius: 1 }}>
                        Pending update
                      </MDTypography>
                    )}
                  </MDTypography>
                  <Icon>{expandedCard === idx ? 'expand_less' : 'expand_more'}</Icon>
                </MDBox>
                <Collapse in={expandedCard === idx} timeout="auto" unmountOnExit>
                  <MDBox px={2} pb={2}>
                    {countryData ? (
                      <>
                        <MDBox
                          component="div"
                          className="ql-editor"
                          sx={{
                            color: 'white !important',
                            '& a': { color: 'primary.main', textDecoration: 'underline' },

                            // Custom sizing:
                            "& h2": {
                              fontSize: "1.5rem",
                              lineHeight: 1.3,
                              margin: "0.75em 0 0.5em",
                            },
                            "& p": {
                              fontSize: "1rem",
                              margin: "0.5em 0",
                            },
                            "& ul": {
                              paddingLeft: "1em",
                              margin: "0.5em 0",
                              fontSize: "1rem",
                            },
                            "& li": {
                              margin: "0.1em 0",
                              fontSize: "1rem",
                            },
                          }}
                          dangerouslySetInnerHTML={{ __html: countryData[card.key] || '' }} />
                        {!isPending && (
                          <Button variant="outlined" sx={{ mt: 2, borderColor: "#F18F01", color: "white !important" }} onClick={(e) => { e.stopPropagation(); handleOpenEditor(card.key); }}>
                            Request update
                          </Button>
                        )}
                      </>
                    ) : (
                      <MDTypography>Loading...</MDTypography>
                    )}
                  </MDBox>
                </Collapse>
              </Card>
            );
          })}
        </MDBox>
      </Card>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: 'inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)',
          }
        }}
      >
        <DialogTitle>Edit {editingField?.replace(/_/g, ' ')}</DialogTitle>
        <DialogContent>
          <MDBox
            sx={{
              '& .ql-toolbar': { backgroundColor: 'rgba(241,143,1,0.2)', borderColor: '#F18F01 !important' },
              '& .ql-toolbar .ql-picker-item:hover': { color: '#F18F01 !important' },
              '& .ql-toolbar .ql-picker-label:hover::after': { borderTop: '6px solid #F18F01 !important' },
              '& .ql-toolbar .ql-active, & .ql-toolbar .ql-active svg': { color: '#F18F01 !important', stroke: '#F18F01 !important', fill: '#F18F01 !important' },
              '& .ql-toolbar .ql-picker-options': { backgroundColor: '#222', borderColor: '#F18F01 !important', color: 'white !important' },
              '& .ql-container': { borderColor: '#F18F01 !important' },
              '& .ql-editor': { backgroundColor: 'transparent', color: 'white !important', minHeight: '300px' },
            }}
          >
            <ReactQuill
              className="custom-quill"
              theme="snow"
              value={editedText}
              onChange={setEditedText}
              modules={{ toolbar: [[{ header: [2, 3, 4, 5, 6, false] }], [{ size: ["small", false, "large", "huge"] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }]] }}
              formats={[
                "header",     // H1–H6
                "size",       // Quill’s small, normal, large, huge
                "bold",
                "italic",
                "underline",
                "list",
                "bullet",
                // …any other formats you add to the toolbar
              ]}
              style={{ marginBottom: '1rem' }}
            />
          </MDBox>
          <MDBox display="flex" justifyContent="flex-start" gap={1}>
            <Button variant="outlined" onClick={handleSave} sx={{ borderColor: '#F18F01', color: '#fff' }}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => setIsDialogOpen(false)} sx={{ borderColor: '#F18F01', color: '#fff' }}>
              Cancel
            </Button>

          </MDBox>
        </DialogContent>
      </Dialog>
    </>
  );
}
