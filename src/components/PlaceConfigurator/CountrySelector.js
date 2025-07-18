import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { COUNTRY_OPTIONS } from './constants';

export default function CountrySelector({ value, onChange }) {
  // Determine the selected country object based on the provided code value
  const selectedOption = COUNTRY_OPTIONS.find(opt => opt.code === value) || null;

  return (
    <Autocomplete
      fullWidth
      options={COUNTRY_OPTIONS}
      getOptionLabel={option => option.name}
      value={selectedOption}
      onChange={(event, newValue) => {
        // Wrap the selected code in an event-like object for compatibility
        onChange({ target: { value: newValue?.code || '' } });
      }}
      isOptionEqualToValue={(option, val) => option.code === val.code}
      renderInput={params => (
        <TextField
          {...params}
          label="Search Country"
          variant="outlined"
          sx={{
            mb: 2,
            height: '48px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#F18F01' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F18F01CC' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F18F01' },
          }}
        />
      )}
    />
  );
}
