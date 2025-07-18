import React from 'react';
import PropTypes from 'prop-types';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import MDTypography from '../../MDTypography';
import formatCost from './formatCost';
import { CURRENCY_OPTIONS } from './constants';
import useExchangeRates from './useExchangeRates';

export default function CostDisplay({ amount, fromCurrency, selectedCurrency, onCurrencyChange }) {
  const { rate, loading } = useExchangeRates(fromCurrency, selectedCurrency);

  let displayValue;
  const parsed = parseFloat(amount);
  if (loading) {
    displayValue = <CircularProgress size={14} />;
  } else if (isNaN(parsed)) {
    displayValue = 'N/A';
  } else {
    displayValue = formatCost(parsed * rate, selectedCurrency);
  }

  return (
    <MDTypography variant="body2" mb={0.5} display="flex" alignItems="center">
      Cost:&nbsp;{displayValue}&nbsp;
      <Select
        value={selectedCurrency}
        size="small"
        onChange={onCurrencyChange}
        sx={{
          mx: 1,
          fontSize: '0.85em',
          minWidth: 60,
          backdropFilter: 'blur(20px)',
          background: 'linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: 'inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)',
          borderRadius: '12px',
          '& .MuiSelect-select': { padding: '2px 14px 2px 8px' },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backdropFilter: 'blur(20px)',
              background: 'linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: 'inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)',
              borderRadius: '12px',
              '& .MuiMenuItem-root': {
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(241,143,1,0.6) !important' },
                '&.Mui-selected': { backgroundColor: 'rgba(241,143,1,0.4)' },
                '&.Mui-selected:hover': { backgroundColor: 'rgba(241,143,1,0.6) !important' },
              },
            }
          }
        }}
      >
        {CURRENCY_OPTIONS.map(opt => (
          <MenuItem key={opt.code} value={opt.code}>
            {opt.code} - {opt.name}
          </MenuItem>
        ))}
      </Select>
    </MDTypography>
  );
}

CostDisplay.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  fromCurrency: PropTypes.string,
  selectedCurrency: PropTypes.string.isRequired,
  onCurrencyChange: PropTypes.func.isRequired,
};