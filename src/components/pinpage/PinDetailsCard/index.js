import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MDBox from '../../MDBox';
import MDTypography from '../../MDTypography';
import CostDisplay from './costDisplay';

export default function PinDetailsCard({ pin }) {
  const [selectedCurrency, setSelectedCurrency] = useState(pin.Currency || 'USD');

  return (
    <MDBox p={2} sx={{
      backdropFilter: 'blur(20px)',
      background: 'linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)',
      border: '1px solid rgba(255,255,255,0.6)',
      boxShadow: 'inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)',
      borderRadius: '12px',
    }}>
      <MDTypography variant="h6" mb={1}>Details</MDTypography>
      {pin.Category && <MDTypography variant="body2" mb={0.5}>Category: {pin.Category}</MDTypography>}
      {pin.Ranking && <MDTypography variant="body2" mb={0.5}>Ranking: {pin.Ranking}</MDTypography>}
      {pin['Average Costs'] && (
        <CostDisplay
          amount={pin['Average Costs']}
          fromCurrency={pin.Currency}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={e => setSelectedCurrency(e.target.value)}
        />
      )}
    </MDBox>
  );
}

PinDetailsCard.propTypes = {
  pin: PropTypes.shape({
    Category: PropTypes.string,
    Ranking: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    'Average Costs': PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    Currency: PropTypes.string,
  }).isRequired,
};