// src/components/PinDetailsCard.js
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MDBox from "../../MDBox";
import MDTypography from "../../MDTypography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";

const CURRENCY_OPTIONS = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "GBP", name: "British Pound" },
  { code: "THB", name: "Thai Baht" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "DZD", name: "Algerian Dinar" },
  { code: "AOA", name: "Angolan Kwanza" },
  { code: "XOF", name: "West African CFA Franc" },
  { code: "BWP", name: "Botswana Pula" },
  { code: "BIF", name: "Burundian Franc" },
  { code: "XAF", name: "Central African CFA Franc" },
  { code: "CVE", name: "Cape Verdean Escudo" },
  { code: "KMF", name: "Comorian Franc" },
  { code: "DJF", name: "Djiboutian Franc" },
  { code: "CDF", name: "Congolese Franc" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "ERN", name: "Eritrean Nakfa" },
  { code: "SZL", name: "Swazi Lilangeni" },
  { code: "ETB", name: "Ethiopian Birr" },
  { code: "GMD", name: "Gambian Dalasi" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "GNF", name: "Guinean Franc" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "LSL", name: "Lesotho Loti" },
  { code: "LRD", name: "Liberian Dollar" },
  { code: "LYD", name: "Libyan Dinar" },
  { code: "MGA", name: "Malagasy Ariary" },
  { code: "MWK", name: "Malawian Kwacha" },
  { code: "MRU", name: "Mauritanian Ouguiya" },
  { code: "MUR", name: "Mauritian Rupee" },
  { code: "MAD", name: "Moroccan Dirham" },
  { code: "MZN", name: "Mozambican Metical" },
  { code: "NAD", name: "Namibian Dollar" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "RWF", name: "Rwandan Franc" },
  { code: "STN", name: "São Tomé and Príncipe Dobra" },
  { code: "SCR", name: "Seychellois Rupee" },
  { code: "SLL", name: "Sierra Leonean Leone" },
  { code: "SOS", name: "Somali Shilling" },
  { code: "ZAR", name: "South African Rand" },
  { code: "SSP", name: "South Sudanese Pound" },
  { code: "SDG", name: "Sudanese Pound" },
  { code: "TZS", name: "Tanzanian Shilling" },
  { code: "TND", name: "Tunisian Dinar" },
  { code: "UGX", name: "Ugandan Shilling" },
  { code: "ZMW", name: "Zambian Kwacha" },
  { code: "ZWL", name: "Zimbabwean Dollar" },
  { code: "AFN", name: "Afghan Afghani" },
  { code: "AMD", name: "Armenian Dram" },
  { code: "AZN", name: "Azerbaijani Manat" },
  { code: "BHD", name: "Bahraini Dinar" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "BTN", name: "Bhutanese Ngultrum" },
  { code: "BND", name: "Brunei Dollar" },
  { code: "KHR", name: "Cambodian Riel" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "GEL", name: "Georgian Lari" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "INR", name: "Indian Rupee" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "IRR", name: "Iranian Rial" },
  { code: "IQD", name: "Iraqi Dinar" },
  { code: "ILS", name: "Israeli New Shekel" },
  { code: "JOD", name: "Jordanian Dinar" },
  { code: "KZT", name: "Kazakhstani Tenge" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "KGS", name: "Kyrgyzstani Som" },
  { code: "LAK", name: "Lao Kip" },
  { code: "LBP", name: "Lebanese Pound" },
  { code: "MOP", name: "Macanese Pataca" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "MVR", name: "Maldivian Rufiyaa" },
  { code: "MNT", name: "Mongolian Tögrög" },
  { code: "MMK", name: "Burmese Kyat" },
  { code: "NPR", name: "Nepalese Rupee" },
  { code: "KPW", name: "North Korean Won" },
  { code: "OMR", name: "Omani Rial" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "KRW", name: "South Korean Won" },
  { code: "LKR", name: "Sri Lankan Rupee" },
  { code: "SYP", name: "Syrian Pound" },
  { code: "TWD", name: "New Taiwan Dollar" },
  { code: "TJS", name: "Tajikistani Somoni" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "TMT", name: "Turkmenistani Manat" },
  { code: "AED", name: "UAE Dirham" },
  { code: "UZS", name: "Uzbekistani So'm" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "YER", name: "Yemeni Rial" },
  { code: "ALL", name: "Albanian Lek" },
  { code: "BYN", name: "Belarusian Ruble" },
  { code: "BAM", name: "Bosnia-Herzegovina Convertible Mark" },
  { code: "BGN", name: "Bulgarian Lev" },
  { code: "CZK", name: "Czech Koruna" },
  { code: "DKK", name: "Danish Krone" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "ISK", name: "Icelandic Krona" },
  { code: "MDL", name: "Moldovan Leu" },
  { code: "MKD", name: "Macedonian Denar" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "PLN", name: "Polish Zloty" },
  { code: "RON", name: "Romanian Leu" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "RSD", name: "Serbian Dinar" },
  { code: "UAH", name: "Ukrainian Hryvnia" },
  { code: "XCD", name: "East Caribbean Dollar" },
  { code: "AWG", name: "Aruban Florin" },
  { code: "BSD", name: "Bahamian Dollar" },
  { code: "BBD", name: "Barbadian Dollar" },
  { code: "BZD", name: "Belize Dollar" },
  { code: "BMD", name: "Bermudian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "KYD", name: "Cayman Islands Dollar" },
  { code: "CRC", name: "Costa Rican Colón" },
  { code: "CUP", name: "Cuban Peso" },
  { code: "ANG", name: "Netherlands Antillean Guilder" },
  { code: "DOP", name: "Dominican Peso" },
  { code: "GTQ", name: "Guatemalan Quetzal" },
  { code: "HTG", name: "Haitian Gourde" },
  { code: "HNL", name: "Honduran Lempira" },
  { code: "JMD", name: "Jamaican Dollar" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "NIO", name: "Nicaraguan Córdoba" },
  { code: "PAB", name: "Panamanian Balboa" },
  { code: "TTD", name: "Trinidad and Tobago Dollar" },
  { code: "SBD", name: "Solomon Islands Dollar" },
  { code: "TOP", name: "Tongan Paʻanga" },
  { code: "VUV", name: "Vanuatu Vatu" },
  { code: "ARS", name: "Argentine Peso" },
  { code: "BOB", name: "Bolivian Boliviano" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "COP", name: "Colombian Peso" },
  { code: "FKP", name: "Falkland Islands Pound" },
  { code: "GYD", name: "Guyanese Dollar" },
  { code: "PYG", name: "Paraguayan Guarani" },
  { code: "PEN", name: "Peruvian Sol" },
  { code: "SRD", name: "Surinamese Dollar" },
  { code: "UYU", name: "Uruguayan Peso" },
  { code: "VES", name: "Venezuelan Bolívar" },
  { code: "XPF", name: "CFP Franc" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "WST", name: "Samoan Tala" },
];

// Format cost for display
function formatCost(amount, currency) {
  if (!amount || !currency) return amount;
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount)) return amount;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(parsedAmount);
}


export function PinDetailsCard({ pin }) {
  const [selectedCurrency, setSelectedCurrency] = useState(pin.Currency || "USD");
  const [convertedCost, setConvertedCost] = useState(pin["Average Costs"]);
  const [loading, setLoading] = useState(false);

  // Convert cost if currency or selection changes
  useEffect(() => {
  if (
    !pin.Currency ||
    !pin["Average Costs"] ||
    !selectedCurrency ||
    pin.Currency === selectedCurrency
  ) {
    setConvertedCost(pin["Average Costs"]);
    setLoading(false);
    return;
  }
  setLoading(true);

  // Use exchangerate.host (no API key needed)
  const url = `/.netlify/functions/convert?from=${pin.Currency}&to=${selectedCurrency}&amount=${pin["Average Costs"]}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data && typeof data.result === "number") {
      setConvertedCost(data.result);
    } else {
      setConvertedCost("N/A");
    }
    setLoading(false);
  })
  .catch(() => {
    setConvertedCost("N/A");
    setLoading(false);
  });
}, [selectedCurrency, pin.Currency, pin["Average Costs"]]);


  return (
    <MDBox
      p={2}
      sx={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow:
          "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
        borderRadius: "12px",
      }}
    >
      <MDTypography variant="h6" mb={1}>
        Details
      </MDTypography>
      {pin.Category && (
        <MDTypography variant="body2" mb={0.5}>
          Category: {pin.Category}
        </MDTypography>
      )}
      {pin.Ranking && (
        <MDTypography variant="body2" mb={0.5}>
          Ranking: {pin.Ranking}
        </MDTypography>
      )}
      {pin["Average Costs"] && (
        <MDTypography variant="body2" mb={0.5} display="flex" alignItems="center">
          Cost:&nbsp;
          {loading ? (
            <CircularProgress size={14} sx={{ mx: 1 }} />
          ) : (
            formatCost(convertedCost, selectedCurrency)
          )}
          &nbsp;
          <Select
            value={selectedCurrency}
            size="small"
            sx={{
              mx: 1,
              fontSize: "0.85em",
              minWidth: 60,
              background: "rgba(241,143,1,0.10)",
              "& .MuiSelect-select": { padding: "2px 14px 2px 8px" },
            }}
            onChange={e => setSelectedCurrency(e.target.value)}
          >
            {CURRENCY_OPTIONS.map(opt => (
              <MenuItem key={opt.code} value={opt.code}>
                {opt.code} - {opt.name}
              </MenuItem>
            ))}
          </Select>
        </MDTypography>
      )}
    </MDBox>
  );
}

PinDetailsCard.propTypes = {
  pin: PropTypes.shape({
    Category: PropTypes.string,
    Ranking: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    "Average Costs": PropTypes.string,
    Currency: PropTypes.string,
  }).isRequired,
};
