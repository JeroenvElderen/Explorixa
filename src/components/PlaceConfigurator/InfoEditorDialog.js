import React from 'react';
import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

export default function InfoEditorDialog({ open, value, onChange, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Information</DialogTitle>
      <DialogContent>
        <div style={{ border: '1px solid #F18F01', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
          <SimpleMDE
            value={value}
            onChange={onChange}
            options={{ autofocus: true, spellChecker: false, toolbar: [] }}
          />
        </div>
        <Button variant="outlined" onClick={onClose}>Done</Button>
      </DialogContent>
    </Dialog>
  );
}