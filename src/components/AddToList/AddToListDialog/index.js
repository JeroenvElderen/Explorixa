// src/components/AddToList/AddToListDialog.jsx
import React, { useEffect, useState, useCallback } from "react";
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
  const [initialListsContainingPin, setInitialListsContainingPin] = useState([]);

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
        } else if (!data) {
          setLists([]);
        } else {
          setLists(data);
        }
      });
  }, [open, user]);

  // Normalize and validate pin ID
  const normalizedPinId = (() => {
    if (!pin?.id) return null;
    const num = Number(pin.id);
    if (Number.isNaN(num)) return null;
    return num;
  })();

  const isAlreadySavedLocally = pins.some(
    (p) => p.id?.toString() === pin?.id?.toString()
  );

  // Load current list_pins membership on open to prefill selectedLists
  const refreshMembership = useCallback(async () => {
    if (!open || !normalizedPinId || !user) return;
    const { data, error } = await supabase
      .from("list_pins")
      .select("list_id")
      .eq("pin_id", normalizedPinId);
    if (error) {
      console.error("Error fetching list_pins for pin:", error);
      return;
    }
    const listIds = Array.isArray(data) ? data.map((r) => r.list_id) : [];
    setSelectedLists(listIds);
    setInitialListsContainingPin(listIds);
  }, [open, normalizedPinId, user]);

  useEffect(() => {
    refreshMembership();
  }, [refreshMembership]);

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
    if (error) {
      console.error("Failed to delete list:", error);
      return alert("Couldn’t delete list.");
    }
    setLists((ls) => ls.filter((l) => l.id !== listId));
    setSelectedLists((sel) => sel.filter((x) => x !== listId));
    setInitialListsContainingPin((sel) => sel.filter((x) => x !== listId));
  };

  const handleSave = async () => {
    if (!user) return alert("You must be logged in to save.");
    if (!normalizedPinId) {
      console.error("Invalid or missing pin.id:", pin);
      return alert("Cannot save: invalid or missing pin ID.");
    }

    // 1) Optionally create a new list (with reuse on duplicate)
    let newId = null;
    if (newListName.trim()) {
      const trimmed = newListName.trim();
      let created = null;

      const { data: insertData, error: insertError } = await supabase
        .from("lists")
        .insert({ user_id: user.id, name: trimmed })
        .select()
        .single();

      if (insertError) {
        const isDup =
          insertError.code === "23505" ||
          /duplicate key value/.test(insertError.message || "");
        if (isDup) {
          const { data: existing, error: fetchExistingErr } = await supabase
            .from("lists")
            .select("id")
            .eq("user_id", user.id)
            .eq("name", trimmed)
            .maybeSingle();
          if (fetchExistingErr) {
            console.error(
              "Error fetching existing list after duplicate name:",
              fetchExistingErr
            );
            return alert(
              `Couldn’t create or reuse list: ${fetchExistingErr.message}`
            );
          }
          if (!existing || !existing.id) {
            console.warn(
              "Expected existing list but got none after duplicate error",
              existing
            );
            return alert("Couldn’t create or find existing list.");
          }
          created = existing;
        } else {
          console.error("Error creating list:", insertError);
          return alert(`Couldn’t create list: ${insertError.message}`);
        }
      } else {
        created = insertData;
      }

      if (!created || !created.id) {
        console.warn("List creation/reuse yielded no valid id:", created);
        return alert("Couldn’t create list (no ID returned).");
      }
      newId = created.id;
    }

    // 2) Build final list-of-lists to associate with
    const finalListIds = [...selectedLists];
    if (newId) finalListIds.push(newId);

    // 3) Compute diffs: to add and to remove
    const toAdd = finalListIds.filter(
      (id) => !initialListsContainingPin.includes(id)
    );
    const toRemove = initialListsContainingPin.filter(
      (id) => !finalListIds.includes(id)
    );

    // 4) If no final lists AND no list membership change, treat as toggle of local favorite
    if (finalListIds.length === 0 && initialListsContainingPin.length === 0) {
      isAlreadySavedLocally ? remove(pin) : save(pin);
      onSaved?.();
      onClose();
      return;
    }

    // 5) Apply additions
    if (toAdd.length > 0) {
      const addRows = toAdd.map((list_id) => ({
        list_id,
        pin_id: normalizedPinId,
      }));
      const { error: insertError } = await supabase
        .from("list_pins")
        .insert(addRows, { ignoreDuplicates: true });
      if (insertError) {
        console.error("Error adding to list_pins:", insertError);
        return alert(`Couldn’t add pin to list: ${insertError.message}`);
      }
    }

    // 6) Apply removals
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from("list_pins")
        .delete()
        .in("list_id", toRemove)
        .eq("pin_id", normalizedPinId);
      if (deleteError) {
        console.error("Error removing from list_pins:", deleteError);
        return alert(
          `Couldn’t remove pin from list: ${deleteError.message}`
        );
      }
    }

    // 7) Adjust saved_count only if crossing the threshold between zero lists <> some lists
    const wasInAny = initialListsContainingPin.length > 0;
    const isInAnyNow = finalListIds.length > 0;
    let updatedSavedCount = pin?.saved_count ?? 0;

    if (!wasInAny && isInAnyNow) {
      // zero -> some: increment
      const { data: existingPin, error: fetchError } = await supabase
        .from("pins")
        .select("saved_count")
        .eq("id", normalizedPinId)
        .single();
      let currentCount = pin?.saved_count ?? 0;
      if (
        !fetchError &&
        existingPin &&
        typeof existingPin.saved_count === "number"
      ) {
        currentCount = existingPin.saved_count;
      }
      const { error: countError } = await supabase
        .from("pins")
        .update({ saved_count: currentCount + 1 })
        .eq("id", normalizedPinId);
      if (countError) {
        console.error("Error incrementing saved_count:", countError);
      } else {
        updatedSavedCount = currentCount + 1;
      }
    } else if (wasInAny && !isInAnyNow) {
      // some -> zero: decrement
      const { data: existingPin, error: fetchError } = await supabase
        .from("pins")
        .select("saved_count")
        .eq("id", normalizedPinId)
        .single();
      let currentCount = pin?.saved_count ?? 0;
      if (
        !fetchError &&
        existingPin &&
        typeof existingPin.saved_count === "number"
      ) {
        currentCount = existingPin.saved_count;
      }
      const next = Math.max(currentCount - 1, 0);
      const { error: countError } = await supabase
        .from("pins")
        .update({ saved_count: next })
        .eq("id", normalizedPinId);
      if (countError) {
        console.error("Error decrementing saved_count:", countError);
      } else {
        updatedSavedCount = next;
      }
    }

    // 8) Finalize local state (favorite)
    if (isInAnyNow) {
      save(pin);
    } else {
      remove(pin);
    }

    // 9) Sync local pin saved_count so UI reflects it if parent passed it down
    // It's expected that parent will re-fetch or this component's pin prop is derived,
    // so optionally you could call onSaved with updated info.
    onSaved?.();

    // 10) Keep internal membership baseline accurate for next interaction
    setInitialListsContainingPin(finalListIds);
    setSelectedLists(finalListIds);

    // 11) Close
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
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
        },
      }}
    >
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
