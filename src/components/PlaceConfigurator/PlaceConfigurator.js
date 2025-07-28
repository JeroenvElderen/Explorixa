import React from 'react';
import ConfiguratorRoot from 'examples/Configurator/ConfiguratorRoot';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import Icon from '@mui/material/Icon';
import Divider from '@mui/material/Divider';
import PlaceSearch from 'components/PlaceSearch';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import { useMaterialUIController, setOpenConfigurator } from 'context';


import CountrySelector from './CountrySelector';
import CurrencySelector from './CurrencySelector';
import ImageUploader from './ImageUploader';
import InfoEditorDialog from './InfoEditorDialog';
import usePlaceForm from './hooks/usePlaceForm';    // ← correct path

export default function PlaceConfigurator(props) {
  const {
    accessToken,
    userId,
    onPlacePick,
    onActivateMapClick,
    initialData,
    onPlaceSelected,
    onCancel,
    countryCode,
  } = props;

  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator } = controller;
  const theme = useTheme();

  const {
    searchCountry,
    setSearchCountry,
    
    setSelectedPlace,
    form,
    setForm,
   
    mainImageFile,
    multiImageFiles,
    currencyAnchor,
    handleCurrencyClick,
    handleCurrencyClose,
    isEditorOpen,
    setIsEditorOpen,
    handlePlaceSelected,
    handleSubmit,
    handleCancelForm,
    setMainImageFile,
    setMultiImageFiles,
  } = usePlaceForm({
    initialCountryCode: countryCode,
    initialData,
    userId,
    accessToken,
    onPlacePick,
    onActivateMapClick,
    onPlaceSelected,
    onCancel,
    setOpenConfigurator,
    controllerDispatch: dispatch,
  });

  const outlinedInputSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: 48,
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01" },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01CC" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#F18F01" },
    },
    "& .MuiOutlinedInput-input": {
      height: 48,
      boxSizing: "border-box",
      padding: "12px 14px",
    },
  };

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
      {/* HEADER */}
      <MDBox display="flex" justifyContent="space-between" alignItems="baseline" pt={{ xs: 2, sm: 4 }} pb={0.5} px={{ xs: 2, sm: 3 }}>
        <MDTypography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' }, fontWeight: 600 }}>
          Create a New Pin
        </MDTypography>
        <Icon onClick={e => { e.stopPropagation(); handleCancelForm(); }} sx={{ cursor: 'pointer', color: '#F18F01', fontSize: '24px !important' }}>
          close
        </Icon>
      </MDBox>
      <Divider />

      {/* BODY */}
      <MDBox sx={{ flex: 1, overflowY: 'auto' }} pt={1} pb={3} px={{ xs: 2, sm: 3 }}>
        <CountrySelector
          value={searchCountry}
          onChange={e => {
            setSearchCountry(e.target.value);
            setForm(f => ({ ...f, Latitude: "", Longitude: "" }));
            setSelectedPlace(null);
          }}
        />

        <PlaceSearch
          countryCode={searchCountry || null}
          accessToken={accessToken}
          onPlaceSelected={handlePlaceSelected}
          onActivateMapClick={onActivateMapClick}
          inputClass="place-search-input"
          suggestionClass="place-search-suggestions"
        />

        <form onSubmit={handleSubmit}>
          <MDBox display="flex" flexDirection="column" gap={{ xs: 1.5, sm: 2 }}>
            {/* Title */}
            <TextField
              fullWidth
              label="Title"
              value={form.Name}
              onChange={e => setForm(f => ({ ...f, Name: e.target.value }))}
              required
              InputLabelProps={{ sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }}
              sx={{ mt: { xs: 1, sm: 2 }, ...outlinedInputSx }}
            />

            {/* Post Summary */}
            <TextField
              fullWidth
              label="Post Summary"
              value={form["Post Summary"]}
              onChange={e => setForm(f => ({ ...f, ["Post Summary"]: e.target.value }))}
              InputLabelProps={{ sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }}
              sx={outlinedInputSx}
            />

            {/* Hidden coords */}
            <input type="hidden" name="Latitude" value={form.Latitude} />
            <input type="hidden" name="Longitude" value={form.Longitude} />

            {/* Country text */}
            <TextField
              fullWidth
              label="Country"
              value={form.countryName}
              onChange={e => setForm(f => ({ ...f, countryName: e.target.value }))}
              InputLabelProps={{ sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }}
              sx={outlinedInputSx}
            />

            {/* City */}
            <TextField
              fullWidth
              label="City"
              value={form.City}
              required
              onChange={e => setForm(f => ({ ...f, City: e.target.value }))}
              InputLabelProps={{ sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }}
              sx={outlinedInputSx}
            />

            {/* Category */}
            <FormControl fullWidth variant="outlined" sx={{ mb: { xs: 1.5, sm: 2 } }}>
              <InputLabel sx={{ color: "#fff", "&.Mui-focused": { color: "#fff" } }}>Category</InputLabel>
              <Select
                label="Category"
                value={form.Category}
                onChange={e => setForm(f => ({ ...f, Category: e.target.value }))}
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
                  }
                }}
              >
                <MenuItem value="Category1">Category1</MenuItem>
                <MenuItem value="Category2">Category2</MenuItem>
                <MenuItem value="Category3">Category3</MenuItem>
              </Select>
            </FormControl>

            {/* Information */}
            <div>
              <label style={{ color: "#fff", marginBottom: 8, display: "block" }}>Information</label>
              <Button
                variant="outlined"
                fullWidth
                sx={{ borderColor: "#F18F01", color: "#fff", textTransform: "none" }}
                onClick={() => setIsEditorOpen(true)}
              >
                Open text editor
              </Button>
            </div>

            {/* Ranking & Costs */}
            <MDBox display="flex" gap={2}>
              <TextField
                fullWidth
                label="Ranking"
                type="number"
                value={form.Ranking}
                onChange={e => setForm(f => ({ ...f, Ranking: e.target.value }))}
                InputLabelProps={{ sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }}
                sx={{ ...outlinedInputSx, flex: 1 }}
              />
              <TextField
                fullWidth
                label="Average Costs"
                type="number"
                value={form["Average Costs"]}
                onChange={e => setForm(f => ({ ...f, ["Average Costs"]: e.target.value }))}
                InputLabelProps={{ sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } } }}
                sx={{ ...outlinedInputSx, flex: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <span
                        style={{
                          color: "#F18F01",
                          fontWeight: 500,
                          fontSize: "0.80em",
                          opacity: 0.7,
                          marginRight: 7,
                          letterSpacing: 1,
                          cursor: "pointer",
                          borderBottom: "1px dashed #F18F01",
                          transition: "border-bottom 0.2s",
                        }}
                        title="Change currency"
                        onClick={e => {
                          e.stopPropagation();
                          // find the nearest OutlinedInput wrapper
                          const inputRoot = e.currentTarget.closest('.MuiOutlinedInput-root');
                          handleCurrencyClick(inputRoot);
                        }}
                        onMouseOver={e => (e.currentTarget.style.borderBottom = "1px solid #F18F01")}
                        onMouseOut={e => (e.currentTarget.style.borderBottom = "1px dashed #F18F01")}
                      >
                        {form.Currency || "Valuta"}
                      </span>
                      <CurrencySelector
                        anchorEl={currencyAnchor}
                        currency={form.Currency}
                        onSelect={code => setForm(f => ({ ...f, Currency: code }))}
                        onClose={handleCurrencyClose}
                      />
                    </InputAdornment>
                  )
                }}
              />
            </MDBox>

            {/* Images */}
            <ImageUploader
              mainFile={mainImageFile}
              onMainChange={setMainImageFile}
              multiFiles={multiImageFiles}
              onMultiChange={setMultiImageFiles}
            />

            {/* Submit / Cancel */}
            <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mt={1}>
              <Button
                variant="contained"
                type="submit"
                sx={{ width: "100%", backgroundColor: "#F18F01", color: "white!important", fontWeight: 600 }}
              >
                Save Pin
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancelForm}
                sx={{ width: "100%", borderColor: "#F18F01", color: "white!important", fontWeight: 600 }}
              >
                Cancel
              </Button>
            </MDBox>

            <MDBox height={150} />
          </MDBox>
        </form>

        {/* Markdown Editor */}
        <InfoEditorDialog
          open={isEditorOpen}
          value={form.Information}
          onChange={val => setForm(f => ({ ...f, Information: val }))}
          onClose={() => setIsEditorOpen(false)}
        />
      </MDBox>
    </ConfiguratorRoot>
  );
}
