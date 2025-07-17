// src/components/PlaceConfigurator.jsx

import React, { useState, useEffect, useRef } from "react";
import ConfiguratorRoot from "examples/Configurator/ConfiguratorRoot";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import PlaceSearch from "components/PlaceSearch";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { useTheme } from "@mui/material/styles";
import imageCompression from "browser-image-compression";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";



import { useMaterialUIController, setOpenConfigurator } from "context";
import { supabase } from "../SupabaseClient";
import { v4 as uuidv4 } from "uuid";
import "../App.css";

const BUCKET = "pins-images";
const COUNTRY_OPTIONS = [
  { code: "", name: "All Countries" },
  { code: "se", name: "Sweden" },
  { code: "us", name: "United States" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "af", name: "Afghanistan" },
];

async function fetchContinent(countryName) {
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const [record] = await res.json();
  return record?.region || null;
}

export default function PlaceConfigurator({
  countryCode: initialCountryCode,
  userId,
  accessToken,
  onPlacePick,
  onActivateMapClick,
  initialData = {},
  onPlaceSelected,
  onCancel,
}) {
  const inputHeight = 48;
  const outlinedInputSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: inputHeight,
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01" },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01CC" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01" },
    },
    "& .MuiOutlinedInput-input": {
      height: inputHeight,
      boxSizing: "border-box",
      padding: "12px 14px",
    },
  };

  const [currencyAnchor, setCurrencyAnchor] = useState(null);

  const handleCurrencyClick = (event) => {
    setCurrencyAnchor(event.currentTarget);
  };

  const handleCurrencyClose = () => {
    setCurrencyAnchor(null);
  };

  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator, darkMode } = controller;
  const theme = useTheme();

  const [currencySelected, setCurrencySelected] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState(initialData);
  const [searchCountry, setSearchCountry] = useState(initialCountryCode || "");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [form, setForm] = useState({
    Name: "",
    "Post Summary": "",
    Information: "",
    Category: "",
    Ranking: "",
    "Average Costs": "",
    Currency: "",
    MainImage: "",
    Images: [],
    Latitude: "",
    Longitude: "",
    countryName: "",
    City: "",
  });

  const mainImageInputRef = useRef(null);
  const multiImageInputRef = useRef(null);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [multiImageFiles, setMultiImageFiles] = useState([]);
  const currencySelectRef = useRef();


  const COUNTRY_TO_CURRENCY = {
    // Africa
    "Algeria": "DZD",
    "Angola": "AOA",
    "Benin": "XOF",
    "Botswana": "BWP",
    "Burkina Faso": "XOF",
    "Burundi": "BIF",
    "Cameroon": "XAF",
    "Cape Verde": "CVE",
    "Central African Republic": "XAF",
    "Chad": "XAF",
    "Comoros": "KMF",
    "Djibouti": "DJF",
    "DR Congo": "CDF",
    "Egypt": "EGP",
    "Equatorial Guinea": "XAF",
    "Eritrea": "ERN",
    "Eswatini": "SZL",
    "Ethiopia": "ETB",
    "Gabon": "XAF",
    "Gambia": "GMD",
    "Ghana": "GHS",
    "Guinea": "GNF",
    "Guinea-Bissau": "XOF",
    "Ivory Coast": "XOF",
    "Kenya": "KES",
    "Lesotho": "LSL",
    "Liberia": "LRD",
    "Libya": "LYD",
    "Madagascar": "MGA",
    "Malawi": "MWK",
    "Mali": "XOF",
    "Mauritania": "MRU",
    "Mauritius": "MUR",
    "Mayotte": "EUR",
    "Morocco": "MAD",
    "Mozambique": "MZN",
    "Namibia": "NAD",
    "Niger": "XOF",
    "Nigeria": "NGN",
    "Republic of the Congo": "XAF",
    "Reunion": "EUR",
    "Rwanda": "RWF",
    "Sao Tome and Principe": "STN",
    "Senegal": "XOF",
    "Seychelles": "SCR",
    "Sierra Leone": "SLL",
    "Somalia": "SOS",
    "South Africa": "ZAR",
    "South Sudan": "SSP",
    "Sudan": "SDG",
    "Tanzania": "TZS",
    "Togo": "XOF",
    "Tunisia": "TND",
    "Uganda": "UGX",
    "Western Sahara": "MAD",
    "Zambia": "ZMW",
    "Zimbabwe": "ZWL",

    // Antarctica (no local currency)
    "Antarctica": "USD",

    // Asia
    "Afghanistan": "AFN",
    "Armenia": "AMD",
    "Azerbaijan": "AZN",
    "Bahrain": "BHD",
    "Bangladesh": "BDT",
    "Bhutan": "BTN",
    "Brunei": "BND",
    "Cambodia": "KHR",
    "China": "CNY",
    "Georgia": "GEL",
    "Hong Kong": "HKD",
    "India": "INR",
    "Indonesia": "IDR",
    "Iran": "IRR",
    "Iraq": "IQD",
    "Israel": "ILS",
    "Japan": "JPY",
    "Jordan": "JOD",
    "Kazakhstan": "KZT",
    "Kuwait": "KWD",
    "Kyrgyzstan": "KGS",
    "Laos": "LAK",
    "Lebanon": "LBP",
    "Macau": "MOP",
    "Malaysia": "MYR",
    "Maldives": "MVR",
    "Mongolia": "MNT",
    "Myanmar": "MMK",
    "Nepal": "NPR",
    "North Korea": "KPW",
    "Oman": "OMR",
    "Pakistan": "PKR",
    "Palestine": "ILS",
    "Philippines": "PHP",
    "Qatar": "QAR",
    "Saudi Arabia": "SAR",
    "Singapore": "SGD",
    "South Korea": "KRW",
    "Sri Lanka": "LKR",
    "Syria": "SYP",
    "Taiwan": "TWD",
    "Tajikistan": "TJS",
    "Thailand": "THB",
    "Timor-Leste": "USD",
    "Turkey": "TRY",
    "Turkmenistan": "TMT",
    "United Arab Emirates": "AED",
    "Uzbekistan": "UZS",
    "Vietnam": "VND",
    "Yemen": "YER",

    // Europe
    "Albania": "ALL",
    "Andorra": "EUR",
    "Austria": "EUR",
    "Belarus": "BYN",
    "Belgium": "EUR",
    "Bosnia and Herzegovina": "BAM",
    "Bulgaria": "BGN",
    "Croatia": "EUR",
    "Cyprus": "EUR",
    "Czech Republic": "CZK",
    "Denmark": "DKK",
    "Estonia": "EUR",
    "Faroe Islands": "DKK",
    "Finland": "EUR",
    "France": "EUR",
    "Germany": "EUR",
    "Gibraltar": "GIP",
    "Greece": "EUR",
    "Guernsey": "GBP",
    "Hungary": "HUF",
    "Iceland": "ISK",
    "Ireland": "EUR",
    "Isle of Man": "GBP",
    "Italy": "EUR",
    "Jersey": "GBP",
    "Latvia": "EUR",
    "Liechtenstein": "CHF",
    "Lithuania": "EUR",
    "Luxembourg": "EUR",
    "Malta": "EUR",
    "Moldova": "MDL",
    "Monaco": "EUR",
    "Montenegro": "EUR",
    "Netherlands": "EUR",
    "North Macedonia": "MKD",
    "Norway": "NOK",
    "Poland": "PLN",
    "Portugal": "EUR",
    "Romania": "RON",
    "Russia": "RUB",
    "San Marino": "EUR",
    "Serbia": "RSD",
    "Slovakia": "EUR",
    "Slovenia": "EUR",
    "Spain": "EUR",
    "Sweden": "SEK",
    "Switzerland": "CHF",
    "Ukraine": "UAH",
    "United Kingdom": "GBP",
    "Vatican City": "EUR",

    // North America & Caribbean
    "Anguilla": "XCD",
    "Antigua and Barbuda": "XCD",
    "Aruba": "AWG",
    "Bahamas": "BSD",
    "Barbados": "BBD",
    "Belize": "BZD",
    "Bermuda": "BMD",
    "British Virgin Islands": "USD",
    "Canada": "CAD",
    "Cayman Islands": "KYD",
    "Costa Rica": "CRC",
    "Cuba": "CUP",
    "Curacao": "ANG",
    "Dominica": "XCD",
    "Dominican Republic": "DOP",
    "El Salvador": "USD",
    "Greenland": "DKK",
    "Grenada": "XCD",
    "Guadeloupe": "EUR",
    "Guatemala": "GTQ",
    "Haiti": "HTG",
    "Honduras": "HNL",
    "Jamaica": "JMD",
    "Martinique": "EUR",
    "Mexico": "MXN",
    "Montserrat": "XCD",
    "Nicaragua": "NIO",
    "Panama": "PAB",
    "Puerto Rico": "USD",
    "Saint Barthelemy": "EUR",
    "Saint Kitts and Nevis": "XCD",
    "Saint Lucia": "XCD",
    "Saint Martin": "EUR",
    "Saint Pierre and Miquelon": "EUR",
    "Saint Vinent and the Grenadines": "XCD",
    "Sint Maarten": "ANG",
    "Trinidad and Tobago": "TTD",
    "Turks and Caicos Islands": "USD",
    "United States": "USD",
    "United States Virgin Islands": "USD",

    // Oceania
    "American Samoa": "USD",
    "Australia": "AUD",
    "Cook Islands": "NZD",
    "Fiji": "FJD",
    "French Polynesia": "XPF",
    "Guam": "USD",
    "Kiribati": "AUD",
    "Marshall Islands": "USD",
    "Micronesia": "USD",
    "Nauru": "AUD",
    "New Caledonia": "XPF",
    "New Zealand": "NZD",
    "Niue": "NZD",
    "Northern Mariana Islands": "USD",
    "Palau": "USD",
    "Papua New Guinea": "PGK",
    "Samoa": "WST",
    "Solomon Islands": "SBD",
    "Tokelau": "NZD",
    "Tonga": "TOP",
    "Tuvalu": "AUD",
    "Vanuatu": "VUV",
    "Wallis and Futuna": "XPF",

    // South America
    "Argentina": "ARS",
    "Bolivia": "BOB",
    "Brazil": "BRL",
    "Chile": "CLP",
    "Colombia": "COP",
    "Ecuador": "USD",
    "Falkland Islands": "FKP",
    "French Guiana": "EUR",
    "Guyana": "GYD",
    "Paraguay": "PYG",
    "Peru": "PEN",
    "Suriname": "SRD",
    "Uruguay": "UYU",
    "Venezuela": "VES",
  };
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


  const handleCancelForm = () => {
    setSelectedPlace(null);
    setForm({
      Name: "", "Post Summary": "", Information: "", Category: "",
      Ranking: "", "Average Costs": "", MainImage: "", Images: [],
      Latitude: "", Longitude: "", countryName: "", City: "",
    });
    setMainImageFile(null);
    setMultiImageFiles([]);
    setOpenConfigurator(dispatch, false);
    onCancel?.();
  };

  const uploadImage = async (file) => {
    const compressedFile = await imageCompression(file, {
      maxWidthOrHeight: 1000,
      useWebWorker: true,
      initialQuality: 0.8,
    });
    const ext = compressedFile.name.split(".").pop();
    const path = `${uuidv4()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, compressedFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: compressedFile.type,
      });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlace?.lat || !selectedPlace?.lng) {
      alert("Please choose a place on the map first.");
      return;
    }
    try {
      const payload = {
        user_id: userId,
        Name: form.Name,
        "Post Summary": form["Post Summary"],
        Information: form.Information,
        Category: form.Category,
        Ranking: form.Ranking || null,
        "Average Costs": form["Average Costs"] || null,
        Currency: form.Currency || null,
        latitude: parseFloat(selectedPlace.lat),
        longitude: parseFloat(selectedPlace.lng),
        countryName: selectedPlace.country,
        City: selectedPlace.city,
        iso: selectedPlace.iso || null,
      };
      if (mainImageFile) {
        payload["Main Image"] = await uploadImage(mainImageFile);
      }
      if (multiImageFiles.length) {
        const urls = await Promise.all(multiImageFiles.map(uploadImage));
        payload.Images = urls.join(",");
      }

      // upsert city
      await supabase
        .from("cities")
        .upsert([{ Name: selectedPlace.city, Country: selectedPlace.country }], { onConflict: ["Name", "Country"] });

      // fetch + upsert country
      let continent = null;
      try { continent = await fetchContinent(selectedPlace.country); } catch { }
      await supabase
        .from("countries")
        .upsert([{ name: selectedPlace.country, continent }], { onConflict: ["name"] });

      // insert pin
      const { error } = await supabase.from("pins").insert([payload]);
      if (error) throw error;

      onPlaceSelected?.(payload);
      handleCancelForm();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  // Sync selectedPlace into form
  useEffect(() => {
    if (selectedPlace) {
      setForm(f => ({
        ...f,
        Name: (
          selectedPlace.name?.trim() ||
          selectedPlace.text?.trim() ||
          selectedPlace.address?.trim() ||
          selectedPlace.landmark?.trim() ||
          selectedPlace.category?.trim() ||
          ""
        ),
        Latitude: selectedPlace.lat,
        Longitude: selectedPlace.lng,
        countryName: selectedPlace.country,
        City:
          selectedPlace.iso?.toUpperCase() === "PEAK"
            ? ""
            : selectedPlace.city || "",
      }));
    }
  }, [selectedPlace]);

  // Initialize from props
  useEffect(() => {
    if (initialData && Object.keys(initialData).length) {
      setSelectedPlace(initialData);
    }
  }, [initialData]);


  useEffect(() => {
    if (selectedPlace) {
      const country = selectedPlace.country;
      const autoCurrency = COUNTRY_TO_CURRENCY[country] || "";
      setForm(f => ({
        ...f,
        Name: (
          selectedPlace.name?.trim() ||
          selectedPlace.text?.trim() ||
          selectedPlace.address?.trim() ||
          selectedPlace.landmark?.trim() ||
          selectedPlace.category?.trim() ||
          ""
        ),
        Latitude: selectedPlace.lat,
        Longitude: selectedPlace.lng,
        countryName: selectedPlace.country,
        City: selectedPlace.iso?.toUpperCase() === "PEAK" ? "" : selectedPlace.city || "",
        Currency: autoCurrency, // <-- set currency automatically here
      }));
    }
  }, [selectedPlace]);


  return (
    <ConfiguratorRoot
      variant="persistent"
      anchor="right"
      open={openConfigurator}
      onClose={handleCancelForm}
      ModalProps={{ hideBackdrop: true, disablePortal: false }}
      sx={{
        "& .MuiDrawer-paper": {
          backdropFilter: "blur(20px)",
          top: 15, right: 15, bottom: 15,
          height: "97vh",
          background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
          border: "1px solid rgba(243,143,1,0.6)",
          boxShadow:
            "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
      PaperProps={{
        sx: {
          zIndex: 1100,
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          [theme.breakpoints.down("sm")]: {
            width: "calc(100vw - 30px) !important",
            maxWidth: "calc(100vw - 30px) !important",
            height: "calc(100vh - 30px) !important",
          },
          [theme.breakpoints.up("sm")]: {
            width: 400,
            maxWidth: "400px",
          },
        },
      }}
      ownerState={{ openConfigurator }}
    >
      {/* Header */}
      <MDBox display="flex" justifyContent="space-between" alignItems="baseline" pt={{ xs: 2, sm: 4 }} pb={0.5} px={{ xs: 2, sm: 3 }}>
        <MDTypography variant="h5" sx={{ fontSize: { xs: "1.15rem", sm: "1.5rem" }, fontWeight: 600 }}>
          Create a New Pin
        </MDTypography>
        <Icon
          onClick={e => { e.stopPropagation(); handleCancelForm(); }}
          sx={{ cursor: "pointer", color: "#F18F01", fontSize: "24px !important" }}
        >
          close
        </Icon>
      </MDBox>
      <Divider />

      {/* Body */}
      <MDBox sx={{ flex: 1, overflowY: "auto", pointerEvents: "auto" }} pt={1} pb={3} px={{ xs: 2, sm: 3 }}>
        {/* Country Select */}
        <FormControl fullWidth variant="outlined" sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <InputLabel id="search-country-label" sx={{ color: "#fff", "&.Mui-focused": { color: "#fff" } }}>
            Search Country
          </InputLabel>
          <Select
            labelId="search-country-label"
            label="Search Country"
            value={searchCountry}
            onChange={e => { setSearchCountry(e.target.value); setSelectedPlace(null); }}
            sx={{
              height: "48px",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01CC" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01" },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "rgba(241,143,1,1)!important",
                  border: "1px solid #F18F01", mt: 1,
                  "& .MuiMenuItem-root": { color: "#fff" },
                  "& .MuiMenuItem-root:hover": { bgcolor: "rgba(0,0,0,0.2)" },
                  "& .MuiMenuItem-root[aria-selected='true']": { bgcolor: "rgba(241,143,1,0.8)", color: "#fff" },
                }
              },
            }}
          >
            {COUNTRY_OPTIONS.map(opt => (
              <MenuItem key={opt.code} value={opt.code}>{opt.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Map Search */}
        <PlaceSearch
          countryCode={searchCountry || null}
          accessToken={accessToken}
          onPlaceSelected={p => {
            // safe destructure
            const [lng, lat] = Array.isArray(p.center)
              ? p.center
              : [p.lng ?? 0, p.lat ?? 0];
            const name = p.text || p.landmark || "";
            const address = p.place_name || "";
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`;
            let country = "", city = "";
            fetch(url)
              .then(res => res.json())
              .then(({ features = [] }) => {
                city = features.find(f => f.place_type.includes("place"))?.text || "";
                country = features.find(f => f.place_type.includes("country"))?.text || "";
                const enriched = { ...p, name, address, lat, lng, country, city };
                setSelectedPlace(enriched);
                onPlacePick?.(enriched);
              })
              .catch(() => {
                const enriched = { ...p, name, address, lat, lng, country: "", city: "" };
                setSelectedPlace(enriched);
                onPlacePick?.(enriched);
              });
          }}
          onActivateMapClick={onActivateMapClick}
          inputClass="place-search-input"
          suggestionClass="place-search-suggestions"
        />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <MDBox display="flex" flexDirection="column" gap={{ xs: 1.5, sm: 2 }}>
            <TextField
              fullWidth label="Title" value={form.Name}
              onChange={e => setForm({ ...form, Name: e.target.value })}
              required
              InputLabelProps={{ sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }}
              sx={{ mt: { xs: 1, sm: 2 }, ...outlinedInputSx }}
            />
            <TextField
              fullWidth label="Post Summary"
              value={form["Post Summary"]}
              onChange={e => setForm({ ...form, ["Post Summary"]: e.target.value })}
              InputLabelProps={{ sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }}
              sx={outlinedInputSx}
            />
            <input type="hidden" name="Latitude" value={form.Latitude} />
            <input type="hidden" name="Longitude" value={form.Longitude} />

            <TextField
              fullWidth label="Country"
              value={form.countryName}
              onChange={e => setForm({ ...form, countryName: e.target.value })}
              InputLabelProps={{ sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }}
              sx={outlinedInputSx}
            />
            <input type="hidden" name="countryName" value={form.countryName} />

            <TextField
              fullWidth label="City" value={form.City}
              required
              onChange={e => setForm({ ...form, City: e.target.value })}
              InputLabelProps={{ sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }}
              sx={outlinedInputSx}
            />

            {/* Category */}
            <FormControl fullWidth variant="outlined" sx={{ mb: { xs: 1.5, sm: 2 } }}>
              <InputLabel sx={{ color: "#fff", "&.Mui-focused": { color: "#fff" } }}>
                Category
              </InputLabel>
              <Select
                label="Category"
                value={form.Category}
                onChange={e => setForm({ ...form, Category: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01CC" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01" },
                  height: "48px",
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "rgba(241,143,1,1)!important",
                      border: "1px solid #F18F01", mt: 1,
                      "& .MuiMenuItem-root": { color: "#fff" },
                      "& .MuiMenuItem-root:hover": { bgcolor: "rgba(0,0,0,0.2)" },
                      "& .MuiMenuItem-root[aria-selected='true']": { bgcolor: "rgba(241,143,1,0.8)", color: "#fff" },
                    }
                  },
                }}
              >
                <MenuItem value="Category1">Category1</MenuItem>
                <MenuItem value="Category2">Category2</MenuItem>
                <MenuItem value="Category3">Category3</MenuItem>
              </Select>
            </FormControl>

            {/* Information Editor */}
            <div>
              <label style={{ color: "#fff", marginBottom: 8, display: "block" }}>
                Information
              </label>
              <Button
                variant="outlined" fullWidth
                sx={{ borderColor: "#F18F01", color: "#fff", textTransform: "none" }}
                onClick={() => setIsEditorOpen(true)}
              >
                Open text editor
              </Button>
            </div>

            {/* Ranking & Costs */}


            <MDBox display="flex" gap={2}>
              {/* Ranking - flex: 1 */}
              <TextField
                fullWidth
                label="Ranking"
                type="number"
                value={form.Ranking}
                onChange={e => setForm({ ...form, Ranking: e.target.value })}
                InputLabelProps={{ sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }}
                sx={{ ...outlinedInputSx, flex: 1 }}
              />

              {/* Average Costs - flex: 2 */}
              <TextField
                fullWidth
                label="Average Costs"
                type="number"
                value={form["Average Costs"]}
                onChange={e => setForm({ ...form, ["Average Costs"]: e.target.value })}
                InputLabelProps={{
                  sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } }
                }}
                sx={{ ...outlinedInputSx, flex: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ minWidth: 30, pr: 0.5 }}>
                      <span
                        style={{
                          color: "#F18F01",
                          fontWeight: 500,
                          fontSize: "0.80em",
                          opacity: 0.7,
                          marginRight: 7,
                          letterSpacing: 1,
                          minWidth: 22,
                          display: "inline-block",
                          textAlign: "right",
                          cursor: "pointer",
                          borderBottom: "1px dashed #F18F01",
                          transition: "border-bottom 0.2s"
                        }}
                        title="Change currency"
                        onClick={handleCurrencyClick}
                        onMouseOver={e => e.currentTarget.style.borderBottom = "1px solid #F18F01"}
                        onMouseOut={e => e.currentTarget.style.borderBottom = "1px dashed #F18F01"}
                      >
                        {form.Currency || "Valuta"}
                      </span>
                      <Menu
                        anchorEl={currencyAnchor}
                        open={Boolean(currencyAnchor)}
                        onClose={handleCurrencyClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                        PaperProps={{
                          sx: {
                            bgcolor: "rgba(241,143,1,1)!important",
                            border: "1px solid #F18F01",
                            mt: 1,
                            "& .MuiMenuItem-root": { color: "#fff" },
                            "& .MuiMenuItem-root:hover": { bgcolor: "rgba(0,0,0,0.2)" },
                            "& .MuiMenuItem-root[aria-selected='true']": { bgcolor: "rgba(241,143,1,0.8)", color: "#fff" },
                          }
                        }}
                      >
                        {CURRENCY_OPTIONS.map(opt => (
                          <MenuItem
                            key={opt.code}
                            selected={form.Currency === opt.code}
                            onClick={() => {
                              setForm({ ...form, Currency: opt.code });
                              handleCurrencyClose();
                            }}
                          >
                            {opt.code} — {opt.name}
                          </MenuItem>
                        ))}
                      </Menu>
                    </InputAdornment>
                  )
                }}
              />
            </MDBox>


            {/* Image Uploads */}
            <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={{ xs: 1, sm: 2 }} mt={1}>
              <div>
                <Button
                  variant={mainImageFile ? "contained" : "outlined"}
                  onClick={() => mainImageInputRef.current.click()}
                  sx={{
                    width: { xs: "138px!important", sm: "auto" },
                    borderColor: !mainImageFile ? "#F18F01" : undefined,
                    color: "#fff!important",
                    mb: { xs: 1, sm: 0 },
                    textTransform: "none",
                    ...(mainImageFile && {
                      backgroundColor: "rgba(241,143,1,0.5)!important",
                      "&:hover": { backgroundColor: "#D17C01!important" }
                    })
                  }}
                >
                  {mainImageFile ? "Image uploaded" : "Upload Main Image"}
                </Button>
                <input type="file" accept="image/*" ref={mainImageInputRef} style={{ display: "none" }}
                  onChange={e => setMainImageFile(e.target.files[0])}
                />
              </div>
              <div>
                <Button
                  variant={multiImageFiles.length ? "contained" : "outlined"}
                  onClick={() => multiImageInputRef.current.click()}
                  sx={{
                    width: { xs: "138px!important", sm: "auto" },
                    borderColor: !multiImageFiles.length ? "#F18F01" : undefined,
                    color: "#fff!important",
                    mb: { xs: 1, sm: 0 },
                    textTransform: "none",
                    ...(multiImageFiles.length && {
                      backgroundColor: "rgba(241,143,1,0.5)!important",
                      "&:hover": { backgroundColor: "#D17C01!important" }
                    })
                  }}
                >
                  {multiImageFiles.length ? "Images uploaded" : "Additional Images"}
                </Button>
                <input type="file" accept="image/*" multiple ref={multiImageInputRef} style={{ display: "none" }}
                  onChange={e => setMultiImageFiles(Array.from(e.target.files))}
                />
              </div>
            </MDBox>

            {/* Submit / Cancel */}
            <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={{ xs: 1, sm: 2 }} mt={1}>
              <Button
                variant="contained" type="submit"
                sx={{ width: "100%", backgroundColor: "#F18F01", color: "white!important", fontWeight: 600 }}
              >
                Save Pin
              </Button>
              <Button
                variant="outlined" onClick={e => { e.stopPropagation(); handleCancelForm(); }}
                sx={{ width: "100%", borderColor: "#F18F01", color: "white!important", fontWeight: 600 }}
              >
                Cancel
              </Button>
            </MDBox>

            <MDBox height={150} />
          </MDBox>
        </form>
      </MDBox>

      {/* Markdown Editor Dialog */}
      <Dialog
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        fullWidth maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(241,143,1,0.6)",
            boxShadow:
              "inset 4px 4px 10px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.1), 0 6px 15px rgba(0,0,0,0.3)",
          }
        }}
      >
        <DialogTitle>Edit Information</DialogTitle>
        <DialogContent>
          <MDBox
            sx={{
              border: "1px solid #F18F01",
              borderRadius: 1,
              overflow: "hidden",
              mb: 2,
            }}
          >
            <SimpleMDE
              className="white-simplemde"
              value={form.Information}
              onChange={val => setForm({ ...form, Information: val })}
              options={{
                autofocus: true,
                spellChecker: false,
                toolbar: [],
              }}
              textareaProps={{
                style: {
                  color: "white",
                  backgroundColor: "transparent",
                }
              }}
            />
          </MDBox>
          <Button
            variant="outlined" onClick={() => setIsEditorOpen(false)}
            sx={{ borderColor: "#F18F01", color: "#fff", mt: 2 }}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </ConfiguratorRoot>
  );
}
