// src/components/AddToList/AddToListDialog.jsx
import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../../../SupabaseClient";
import { useSavedPins } from "../../SavedPinsContext";

export default function ListDialog({ open, onClose, pin, onSaved }) {
  const { pins, save, remove } = useSavedPins();
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [selectedLists, setSelectedLists] = useState([]);
  const [newListName, setNewListName] = useState("");

  // Load auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch lists on dialog open
  useEffect(() => {
    if (!open || !user) return;
    supabase
      .from("lists")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error loading lists:", error);
          setLists([]);
        } else {
          setLists(data || []);
        }
      });
  }, [open, user]);

  const isAlreadySaved = pins.some((p) => p.id?.toString() === pin?.id?.toString());

  const toggleList = (id) =>
    setSelectedLists((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const deleteList = async (listId) => {
    await supabase
      .from("lists")
      .delete()
      .eq("id", listId)
      .eq("user_id", user.id);
    setLists((ls) => ls.filter((l) => l.id !== listId));
    setSelectedLists((sel) => sel.filter((x) => x !== listId));
  };

  const handleSave = async () => {
    if (!user) return alert("You must be logged in to save.");

    // Ensure we have a valid numeric pin ID
    if (!pin?.id) {
      console.error("No pin.id!", pin);
      return alert("Cannot save: missing pin ID.");
    }
    const pinId = Number(pin.id);
    if (Number.isNaN(pinId)) {
      console.error("pin.id is not a number:", pin.id);
      return alert("Cannot save: pin ID is invalid.");
    }

    // 1) Optionally create a new list
    let newId = null;
    if (newListName.trim()) {
      const { data: created, error: createError } = await supabase
        .from("lists")
        .insert({ user_id: user.id, name: newListName.trim() })
        .single();
      if (createError) {
        console.error("Error creating list:", createError);
        return alert(`Couldn’t create list: ${createError.message}`);
      }
      newId = created.id;
    }

    // 2) Build target list IDs
    const allIds = [...selectedLists];
    if (newId) allIds.push(newId);

    // 3) If no lists checked, just toggle local favorites
    if (allIds.length === 0) {
      isAlreadySaved ? remove(pin) : save(pin);
      onSaved?.();
      onClose();
      return;
    }

    // 4) Insert into list_pins
    const rows = allIds.map((list_id) => ({ list_id, pin_id: pinId }));
    const { data: inserted, error: insertError } = await supabase
      .from("list_pins")
      .insert(rows, { ignoreDuplicates: true })
      .select();
    console.log("list_pins.insert result:", { inserted, insertError });
    if (insertError) {
      console.error("Error saving to list_pins:", insertError);
      return alert(`Couldn’t save pin to list: ${insertError.message}`);
    }

    // 5) Increment saved_count on the pin itself
    const currentCount = pin.saved_count ?? 0;
    const { error: countError } = await supabase
      .from("pins")
      .update({ saved_count: currentCount + 1 })
      .eq("id", pinId);
    if (countError) {
      console.error("Error bumping saved_count:", countError);
    }

    // 6) Finalize
    onSaved?.();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: {
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      background:
        "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
      border: "1px solid rgba(255,255,255,0.6)",
      boxShadow:
        "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
      borderRadius: "12px",
      p: 2,
      minWidth: 300,
    }}}>
      <DialogTitle>Add “{pin?.title}” to a list</DialogTitle>

      <DialogContent>
        <List>
          {lists.map((l) => (
            <ListItem
              key={l.id}
              dense
              secondaryAction={
                <IconButton size="small" onClick={() => deleteList(l.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedLists.includes(l.id)}
                    onChange={() => toggleList(l.id)}
                  />
                }
                label={l.name}
              />
            </ListItem>
          ))}
        </List>

        <TextField
          fullWidth
          margin="normal"
          label="Or create new list"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!user} onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
