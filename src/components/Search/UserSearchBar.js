// src/components/Search/UserSearchBar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import {
  Autocomplete,
  TextField,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { supabase } from "SupabaseClient";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

export default function UserSearchBar() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced fetch from Supabase
  const fetchUsers = useMemo(
    () =>
      debounce(async (q) => {
        if (!q) return setOptions([]);
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, Username, avatar_url")
          .ilike("Username", `%${q}%`)
          .limit(10);

        if (error) {
          console.error("Search error:", error);
          setOptions([]);
        } else {
          setOptions(data || []);
        }
        setLoading(false);
      }, 300),
    []
  );

  // Trigger fetch on input change
  useEffect(() => {
    fetchUsers(inputValue);
    return () => {
      fetchUsers.cancel();
    };
  }, [inputValue, fetchUsers]);

  return (
    <Autocomplete
      freeSolo
      PaperComponent={(props) => (
        <Paper
          {...props}
          elevation={4}
          sx={{
            backgroundColor: "#F18F01"
          }}
          />
      )}
      options={options}
      getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.Username)}
      loading={loading}
      onInputChange={(_, newVal) => {
        setInputValue(newVal);
      }}
      onChange={(_, selected) => {
        // Navigate to your dynamic ProfilePage route
        if (selected && selected.user_id) {
          navigate(`/profile/${selected.user_id}`);
        }
      }}
      noOptionsText={inputValue ? "No users found" : "Type to search users…"}
      renderOption={(props, opt) => (
        <ListItem {...props} key={opt.user_id} component="li">
          <ListItemAvatar>
            <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={opt.avatar_url || "https://www.gravatar.com/avatar/?d=mp&s=150"} 
              alt={opt.full_name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
          </ListItemAvatar>
          <ListItemText primary={opt.Username} secondary={opt.full_name} primaryTypographyProps={{ sx: { fontSize: "18px" }}}/>
        </ListItem>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="Search users…"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={16} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{ width: "100%" }}
    />
  );
}
