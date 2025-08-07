// src/components/PinInfoEditor.js
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";

function PinInfoEditor({ initialInfo, open, onClose, onSave }) {
  const [value, setValue] = useState(initialInfo);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Information</DialogTitle>
      <DialogContent>
        <TextField
          multiline
          minRows={6}
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => { onSave(value); onClose(); }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

PinInfoEditor.propTypes = {
  initialInfo: PropTypes.string.isRequired,
  open:        PropTypes.bool.isRequired,
  onClose:     PropTypes.func.isRequired,
  onSave:      PropTypes.func.isRequired,
};

export default PinInfoEditor;
// src/components/pinpage/PinInfoEditor/index.js
