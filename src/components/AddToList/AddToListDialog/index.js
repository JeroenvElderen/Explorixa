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

  // load auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // fetch user's lists when dialog opens
  useEffect(() => {
    if (!open || !user) return;
    supabase
      .from("lists")
      .select("id, name")
      .eq("user_id", user.id)
      .then(({ data }) => setLists(data || []));
  }, [open, user]);

  const isAlreadySaved = pins.some((p) => p.id === pin?.id);

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
    if (!user) return;

    // create new list if requested
    let newId = null;
    if (newListName.trim()) {
      const { data } = await supabase
        .from("lists")
        .insert({ user_id: user.id, name: newListName.trim() })
        .single();
      newId = data?.id;
    }

    const allIds = [...selectedLists, ...(newId ? [newId] : [])];

    if (allIds.length === 0) {
      // no lists chosen → simple toggle
      isAlreadySaved ? remove(pin) : save(pin);
      onSaved?.();
      onClose();
      return;
    }

    // upsert into each list
    await Promise.all(
      allIds.map((list_id) =>
        supabase.from("list_pins").upsert({ list_id, pin_id: pin.id })
      )
    );

    onSaved?.();
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
                        p: 2,                // inner padding
                        minWidth: 300,       // grow to taste
                    }
                }}
    >
      <DialogTitle>Add to a list</DialogTitle>

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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!user || (!selectedLists.length && !newListName.trim())}
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
