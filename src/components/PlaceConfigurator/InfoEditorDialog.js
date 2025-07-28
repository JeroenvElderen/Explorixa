import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Grid,
  Typography,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import '../../App.css';

export default function InfoEditorDialog({ open, value, onChange, onClose }) {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    if (open) {
      setLocalValue(value || '');
    }
  }, [value, open]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    setLocalValue(newVal);
    onChange?.(newVal);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          backgroundColor: '#121212',
          color: 'white',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ color: '#F18F01' }}>Edit Information</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <textarea
              value={localValue}
              onChange={handleChange}
              placeholder="Type markdown here..."
              style={{
                width: '100%',
                height: '300px',
                backgroundColor: '#1e1e1e',
                color: 'white',
                border: '1px solid #F18F01',
                borderRadius: '4px',
                padding: '8px',
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: '14px',
              }}
            />
          </Grid>
          
        </Grid>

        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            mt: 2,
            textTransform: 'none',
            color: '#F18F01',
            borderColor: '#F18F01',
            '&:hover': {
              backgroundColor: '#F18F01',
              color: '#000',
            },
          }}
        >
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}
