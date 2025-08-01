import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { useMaterialUIController } from "context";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { supabase } from "SupabaseClient";
import ReactMarkdown from "react-markdown";
import SimpleMDE from "react-simplemde-editor";
import { motion, AnimatePresence } from "framer-motion";
import "easymde/dist/easymde.min.css";
import DiffMatchPatch from "diff-match-patch";

const highlightChanges = (oldMd, newMd) => {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(oldMd || "", newMd || "");
  dmp.diff_cleanupSemantic(diffs);
  return diffs
    .map(([op, data]) => {
      if (op === 1)  return `<span style="background-color:#d4edda">${data}</span>`;
      if (op === -1) return `<del style="color:red">${data}</del>`;
      return data;
    })
    .join("");
};

const dropdownCards = [
  { title: "Country Info", key: "country_info" },
  { title: "Moving Info",  key: "moving_info" },
  { title: "Animal Info",  key: "animal_info" },
];

export default function Projects({ country }) {
  const [expandedCard, setExpandedCard] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [controller] = useMaterialUIController();

  useEffect(() => {
    if (!country) return;

    const loadCountry = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("countries")
        .select("name, country_info, moving_info, animal_info")
        .eq("name", country)
        .maybeSingle();
      if (error) console.error(error);
      setCountryData(data);
      setLoading(false);
    };

    const loadPending = async () => {
      const { data, error } = await supabase
        .from("pending_updates")
        .select()
        .eq("country", country)
        .eq("status", "pending");
      if (!error) setPendingUpdates(data);
    };

    loadCountry();
    loadPending();

    const updCh = supabase
      .channel("pending_updates")
      .on("postgres_changes",
          { event: "*", schema:"public", table:"pending_updates", filter:`country=eq.${country}` },
          loadPending)
      .subscribe();

    const cntryCh = supabase
      .channel("countries")
      .on("postgres_changes",
          { event: "*", schema:"public", table:"countries", filter:`name=eq.${country}` },
          loadCountry)
      .subscribe();

    return () => {
      supabase.removeChannel(updCh);
      supabase.removeChannel(cntryCh);
    };
  }, [country]);

  const toggleCard = idx =>
    setExpandedCard(expandedCard === idx ? null : idx);

  const openEditor = key => {
    setEditingField(key);
    setEditedText(countryData[key] || "");
    setIsDialogOpen(true);
  };

  const saveUpdate = async () => {
    await supabase.from("pending_updates").insert([{
      country: countryData.name,
      field: editingField,
      old_text: countryData[editingField],
      new_text: editedText,
    }]);
    setIsDialogOpen(false);
  };

  if (loading) return <MDTypography>Loading…</MDTypography>;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.09 }}
      >
        <Card sx={{
          p: 3, mb: 2,
          backdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.14)",
          border: "1px solid rgba(243,143,1,0.45)",
          borderRadius: 3
        }}>
          <MDBox display="flex" justifyContent="space-between" mb={2}>
            <MDTypography variant="h6">
              Details for this country
            </MDTypography>
          </MDBox>

          {dropdownCards.map((card, idx) => {
            const val = countryData[card.key] || "";
            const isPending = pendingUpdates.some(u => u.field === card.key);

            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.54, delay: 0.13 + idx * 0.07 }}
                style={{ borderRadius: 16 }}
              >
                <Card
                  sx={{
                    mb: 2, p: 2,
                    backdropFilter: "blur(20px)",
                    background: "rgba(255,255,255,0.17)",
                    border: "1px solid rgba(243,143,1,0.38)",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "box-shadow 0.2s",
                    boxShadow: expandedCard === idx ? "0 6px 20px 0 rgba(241,143,1,0.10)" : undefined
                  }}
                  onClick={() => toggleCard(idx)}
                >
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="subtitle1" fontWeight="medium">
                      {card.title}
                      {isPending && (
                        <MDTypography
                          variant="caption"
                          color="warning"
                          sx={{ ml: 1, px: 1, borderRadius: 1, background: "#fff3cd" }}
                        >
                          Pending update
                        </MDTypography>
                      )}
                    </MDTypography>
                    <Icon>{expandedCard === idx ? "expand_less" : "expand_more"}</Icon>
                  </MDBox>

                  <Collapse in={expandedCard === idx} timeout="auto" unmountOnExit>
                    <MDBox mt={2}>
                      <MDTypography component="div" sx={{
                        color: "white",
                        "& a": { color: theme.palette.info.main, textDecoration: "underline" },
                        "& h2": { fontSize: "1.4rem", mt: 1, mb: 0.5 },
                        "& p": { fontSize: "1rem", mb: 1 },
                        "& ul": { pl: 2, mb: 1 },
                        "& li": { mb: 0.5 }
                      }}>
                        <ReactMarkdown>{val}</ReactMarkdown>
                      </MDTypography>

                      {!isPending && (
                        <Button
                          variant="outlined"
                          sx={{ mt: 2, borderColor: "#F18F01", color: "white" }}
                          onClick={e => {
                            e.stopPropagation();
                            openEditor(card.key);
                          }}
                        >
                          Request update
                        </Button>
                      )}
                    </MDBox>
                  </Collapse>
                </Card>
              </motion.div>
            );
          })}
        </Card>
      </motion.div>

      <AnimatePresence>
        {isDialogOpen && (
          <Dialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            fullWidth maxWidth="md"
            PaperProps={{
              sx: {
                borderRadius: 2,
                background: "rgba(255,255,255,0.11)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.5)"
              }
            }}
            TransitionComponent={motion.div}
            TransitionProps={{
              initial: { opacity: 0, scale: 0.96 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.93 },
              transition: { duration: 0.23 }
            }}
          >
            <DialogTitle>
              Edit {editingField?.replace(/_/g, " ")}
            </DialogTitle>
            <DialogContent>
              <SimpleMDE
                value={editedText}
                onChange={setEditedText}
                options={{
                  autofocus: true,
                  spellChecker: false,
                  toolbar: [],
                }}
                className="white-simplemde"
              />
              <MDBox display="flex" gap={1} mt={2}>
                <Button
                  variant="outlined"
                  onClick={saveUpdate}
                  sx={{ borderColor: "#F18F01", color: "white" }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsDialogOpen(false)}
                  sx={{ borderColor: "#F18F01", color: "white" }}
                >
                  Cancel
                </Button>
              </MDBox>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
