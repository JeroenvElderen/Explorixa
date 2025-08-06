// src/components/AddToList/AddToListDialog.jsx
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
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
import { useAuth } from "context/AuthContext";

export default function ListDialog({ open, onClose, pin, onSaved }) {
  const { user } = useAuth();               // ← get the logged‐in user
  const { pins, save, remove } = useSavedPins();

  const [lists, setLists] = useState([]);
  const [selectedLists, setSelectedLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [initialListsContainingPin, setInitialListsContainingPin] = useState([]);

  // Normalize pin.id to a number
  const normalizedPinId = (() => {
    if (!pin?.id) return null;
    const num = Number(pin.id);
    return Number.isNaN(num) ? null : num;
  })();

  // Pre‐fill which lists already contain this pin
  const refreshMembership = useCallback(async () => {
    if (!open || !normalizedPinId || !user) return;
    const { data, error } = await supabase
      .from("list_pins")
      .select("list_id")
      .eq("pin_id", normalizedPinId);
    if (error) return console.error("fetch list_pins:", error);
    const listIds = data.map((r) => r.list_id);
    setSelectedLists(listIds);
    setInitialListsContainingPin(listIds);
  }, [open, normalizedPinId, user]);

  // Load user's lists & membership whenever dialog opens or user changes
  useEffect(() => {
    if (!open || !user) return;
    supabase
      .from("lists")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("load lists:", error);
        setLists(data || []);
      });
    refreshMembership();
  }, [open, user, refreshMembership]);

  const toggleList = (id) =>
    setSelectedLists((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const deleteList = async (listId) => {
    if (!user) return;
    const { error } = await supabase
      .from("lists")
      .delete()
      .eq("id", listId)
      .eq("user_id", user.id);
    if (error) return alert("Couldn’t delete list.");
    setLists((ls) => ls.filter((l) => l.id !== listId));
    setSelectedLists((sel) => sel.filter((x) => x !== listId));
    setInitialListsContainingPin((sel) => sel.filter((x) => x !== listId));
  };

  const isAlreadySavedLocally = pins.some(
    (p) => p.id?.toString() === pin?.id?.toString()
  );

  const handleSave = async () => {
    if (!user) {
      alert("You must be logged in to save.");
      return;
    }
    if (!normalizedPinId) {
      console.error("Invalid pin.id:", pin);
      alert("Cannot save: invalid pin ID.");
      return;
    }

    // — create or reuse a new list if name provided —
    let newId = null;
    if (newListName.trim()) {
      const trimmed = newListName.trim();
      const { data: inserted, error: insertErr } = await supabase
        .from("lists")
        .insert({ user_id: user.id, name: trimmed })
        .select()
        .single();

      if (insertErr && insertErr.code !== "23505") {
        console.error("create list error:", insertErr);
        return alert(`Couldn’t create list: ${insertErr.message}`);
      }
      newId = inserted?.id ?? null;
    }

    // — assemble final lists to add/remove against initialListsContainingPin —
    const finalListIds = [...selectedLists];
    if (newId) finalListIds.push(newId);
    const toAdd = finalListIds.filter((x) => !initialListsContainingPin.includes(x));
    const toRemove = initialListsContainingPin.filter((x) => !finalListIds.includes(x));

    // — if nothing changed, toggle local favorite —
    if (!toAdd.length && !toRemove.length) {
      isAlreadySavedLocally ? remove(pin) : save(pin);
      onSaved?.();
      onClose();
      return;
    }

    // — apply additions —
    if (toAdd.length) {
      const rows = toAdd.map((list_id) => ({ list_id, pin_id: normalizedPinId }));
      const { error: addErr } = await supabase
        .from("list_pins")
        .insert(rows, { ignoreDuplicates: true });
      if (addErr) console.error("add to list_pins error:", addErr);
    }

    // — apply removals —
    if (toRemove.length) {
      const { error: delErr } = await supabase
        .from("list_pins")
        .delete()
        .in("list_id", toRemove)
        .eq("pin_id", normalizedPinId);
      if (delErr) console.error("remove from list_pins error:", delErr);
    }

    // — optionally bump saved_count in `pins` table …
    // (you can keep your existing RPC / aggregate logic here)

    // — update local saved/favorite context —
    if (finalListIds.length) save(pin);
    else remove(pin);

    onSaved?.();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add “{pin?.title}” to a list</DialogTitle>
      <DialogContent>
        <List>
          {lists.map((l) => (
            <ListItem key={l.id} dense
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
        <Button onClick={(e) => { e.stopPropagation(); onClose(); }}>
          Cancel
        </Button>
        <Button variant="contained" disabled={!user} onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ListDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pin: PropTypes.object.isRequired,
  onSaved: PropTypes.func,
};

ListDialog.defaultProps = {
  onSaved: () => {},
};
