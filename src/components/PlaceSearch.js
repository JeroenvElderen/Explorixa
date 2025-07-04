import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import Icon from "@mui/material/Icon";
import { SearchBox } from "@mapbox/search-js-react";

export default function PlaceSearch({
  countryCode,
  accessToken,
  onPlaceSelected,
  onActivateMapClick,
  inputClass,
  suggestionsClass,
}) {
  const [searchText, setSearchText] = useState("");

  // Clear the search input whenever the selected country changes
  useEffect(() => {
    setSearchText("");
  }, [countryCode]);

  const handleSelect = (feature) => {
    // 1. Get coordinates
    const coords =
      feature.geometry?.coordinates ||
      feature.result?.geometry?.coordinates ||
      [];
    if (!Array.isArray(coords) || coords.length < 2) {
      console.warn("No coordinates found on selected feature", feature);
      return;
    }
    const [lng, lat] = coords;

    // 2. Normalize context array (v5) vs. object (v6+)
    let ctxArr = [];
    if (Array.isArray(feature.context)) {
      ctxArr = feature.context;
    } else if (Array.isArray(feature.properties?.context)) {
      ctxArr = feature.properties.context;
    }

    // 3. Extract country
    const countryObj = feature.properties?.context?.country;
    const countryCtx = ctxArr.find((c) => c.id.startsWith("country"));
    const countryName =
      countryObj?.name ||
      countryCtx?.text ||
      feature.properties?.country ||
      feature.result?.properties?.country ||
      "";
    const countryCode2 =
      countryObj?.country_code ||
      countryCtx?.short_code ||
      undefined;
    const countryCode3 = countryObj?.country_code_alpha_3;

    // 4. Extract city/locality/region
    const placeObj = feature.properties?.context?.place;
    const localityObj = feature.properties?.context?.locality;
    const regionObj = feature.properties?.context?.region;
    const placeCtx = ctxArr.find((c) => c.id.startsWith("place"));
    const localityCtx = ctxArr.find((c) => c.id.startsWith("locality"));
    const regionCtx = ctxArr.find((c) => c.id.startsWith("region"));

    const city =
      placeObj?.name ||
      localityObj?.name ||
      regionObj?.name ||
      placeCtx?.text ||
      localityCtx?.text ||
      regionCtx?.text ||
      feature.properties?.locality ||
      feature.properties?.region ||
      feature.result?.properties?.locality ||
      feature.result?.properties?.region ||
      feature.text ||
      "";

    // 5. Extract landmark and address
    const landmark =
      feature.properties?.name ||
      feature.result?.text ||
      feature.result?.properties?.name ||
      "";
    const address =
      feature.properties?.full_address ||
      feature.result?.place_name ||
      feature.result?.properties?.full_address ||
      "";

    // 6. Callback with everything
    onPlaceSelected({
      lat,
      lng,
      landmark,
      address,
      city,
      country: countryName,
      countryCode2,
      countryCode3,
    });

    // 7. Update visible input
    setSearchText(address);
  };

  if (!accessToken) return null;

  return (

    <MDBox display="flex" flexDirection="column" width="100%" position="relative">
      <MDBox display="flex" alignItems="center" width="100%" sx={{
        "& .mapbox-search-box": {
          width: "100% !important",
        }
      }}>
        <SearchBox
          style={{ width: "100%" }}
          accessToken={accessToken}
          placeholder="Search for a place…"
          value={searchText}
          onChange={(e) => {
            const v = typeof e === "string" ? e : e?.target?.value || "";
            setSearchText(v);
          }}
          minLength={3}
          onRetrieve={(res) => {
            const feature = res.features?.[0];
            if (feature) handleSelect(feature);
          }}
          // Restrict to the specified country and desired types/categories/etc.
          options={{
            country: countryCode ? countryCode.toUpperCase() : undefined,
            types: ["poi", "place", "locality", "address"],
            categories: ["restaurant", "park", "museum", "bar", "cafe", "tourism"],
            language: "en",          // ← changed to string to avoid split() error
            limit: 5,
          }}
          theme={{
            variables: {
              // solid orange dropdown background
              colorBackground: "#F18F01",
              // you can leave hover/active lighter/darker variants
              colorBackgroundHover: "rgba(255,255,255,0.2)",
              colorBackgroundActive: "rgba(255,255,255,0.3)",
              colorPrimary: "#F18F01",
              colorText: "white",
            },
            cssText: `
            /* Transparent wrapper */
            mapbox-search-box, .mapbox-search-box {
              background: transparent !important;
              width: 500px;
              color: #fff;
            }
            /* INPUT: transparent background */
            mapbox-search-box input {
              background: transparent !important;
              border: 1px solid #F18F01 !important;
              border-radius: 6px !important;
              padding: 0 12px 0 32px !important;
              height: 48px !important;
              color: #fff !important;
              &::placeholder {
              color: #fff !important;
              opacity: 1;
              }
            }
            mapbox-search-box input:focus {
              outline: 2px solid #F18F01 !important;
            }
            /* DROPDOWN: solid orange */
            mapbox-search-box .mapboxgl-ctrl-geocoder--suggestions {
              background: #F18F01 !important;
            }
            /* LIST ITEMS: keep them white on orange */
            mapbox-search-box .mapboxgl-ctrl-geocoder--suggestions li {
              color: #fff !important;
            }
            mapbox-search-box .mapboxgl-ctrl-geocoder--suggestions li:hover {
              background: rgba(255,255,255,0.2) !important;
              color: #000 !important;
            }
            mapbox-search-box .mapboxgl-ctrl-geocoder--suggestions li[aria-selected='true'] {
              background: rgba(255,255,255,0.3) !important;
              color: #000 !important;
            }
          `,
          }}
        />
      </MDBox>
    </MDBox>
  );
}
