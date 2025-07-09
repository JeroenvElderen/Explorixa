// src/components/WorldMapComponent.js
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "../SupabaseClient";
import PopupComponent from "./PopupComponent";
import "./WorldMapComponent.css";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

// "#RRGGBB" → "R,G,B"
function hexToRgbString(hex) {
  const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return "0,0,0";
  return [
    parseInt(m[1], 16),
    parseInt(m[2], 16),
    parseInt(m[3], 16),
  ].join(",");
}

// Utility for cluster icon
function createClusterCanvas(baseHex) {
  const rgb = hexToRgbString(baseHex);
  const size = 40;
  const r = 15;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, `rgba(${rgb},0.85)`);
  grad.addColorStop(1, `rgba(${rgb},0.7)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();
  return canvas;
}

// Utility for country marker
function createMarkerCanvas(baseHex, iso) {
  const rgb = hexToRgbString(baseHex);
  const size = 40;
  const tail = 5;
  const r = 15;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size + tail;
  const ctx = canvas.getContext("2d");

  // Background circle
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, `rgba(${rgb},0.85)`);
  grad.addColorStop(1, `rgba(${rgb},0.7)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Label (emoji or ISO text)
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const isEmoji = /[\u{1F300}-\u{1F6FF}]/u.test(iso); // emoji check
  ctx.font = isEmoji ? "20px serif" : "bold 12px sans-serif";

  ctx.fillText(iso, size / 2, size / 2);

  // Tail
  ctx.fillStyle = `rgba(${rgb},0.85)`;
  ctx.beginPath();
  ctx.moveTo(size / 2 - 7, size / 2 + r - 2);
  ctx.lineTo(size / 2, size + tail - 2);
  ctx.lineTo(size / 2 + 7, size / 2 + r - 2);
  ctx.closePath();
  ctx.fill();

  return canvas;
}


// ── DROP YOUR COUNTRY LOOKUP TABLES HERE ──────────────────────────────────────
// Map country name → ISO
const countryNameToIso = {
  Afghanistan: "AF", Albania: "AL", Algeria: "DZ", Andorra: "AD", Angola: "AO",
  Argentina: "AR", Armenia: "AM", Australia: "AU", Austria: "AT", Azerbaijan: "AZ",
  Bahamas: "BS", Bahrain: "BH", Bangladesh: "BD", Barbados: "BB", Belarus: "BY",
  Belgium: "BE", Belize: "BZ", Benin: "BJ", Bermuda: "BM", Bhutan: "BT",
  Bolivia: "BO", "Bosnia and Herzegovina": "BA", Botswana: "BW", Brazil: "BR",
  Brunei: "BN", Bulgaria: "BG", "Burkina Faso": "BF", Burundi: "BI",
  Cambodia: "KH", Cameroon: "CM", Canada: "CA", "Cape Verde": "CV",
  "Central African Republic": "CF", Chad: "TD", Chile: "CL", China: "CN",
  Colombia: "CO", Comoros: "KM", Congo: "CG", "Democratic Republic of Congo": "CD",
  "Costa Rica": "CR", Croatia: "HR", Cuba: "CU", Cyprus: "CY",
  "Czech Republic": "CZ", Denmark: "DK", Djibouti: "DJ", Dominica: "DM",
  "Dominican Republic": "DO", Ecuador: "EC", Egypt: "EG", "El Salvador": "SV",
  "Equatorial Guinea": "GQ", Eritrea: "ER", Estonia: "EE", Eswatini: "SZ",
  Ethiopia: "ET", Fiji: "FJ", Finland: "FI", France: "FR", Gabon: "GA",
  Gambia: "GM", Georgia: "GE", Germany: "DE", Ghana: "GH", Greece: "GR",
  Greenland: "GL", Grenada: "GD", Guatemala: "GT", Guinea: "GN",
  "Guinea-Bissau": "GW", Guyana: "GY", Haiti: "HT", Honduras: "HN",
  Hungary: "HU", Iceland: "IS", India: "IN", Indonesia: "ID", Iran: "IR",
  Iraq: "IQ", Ireland: "IE", Israel: "IL", Italy: "IT", Jamaica: "JM",
  Japan: "JP", Jordan: "JO", Kazakhstan: "KZ", Kenya: "KE", Kiribati: "KI",
  Kosovo: "XK", Kuwait: "KW", Kyrgyzstan: "KG", Laos: "LA", Latvia: "LV",
  Lebanon: "LB", Lesotho: "LS", Liberia: "LR", Libya: "LY",
  Liechtenstein: "LI", Lithuania: "LT", Luxembourg: "LU", Madagascar: "MG",
  Malawi: "MW", Malaysia: "MY", Maldives: "MV", Mali: "ML", Malta: "MT",
  "Marshall Islands": "MH", Martinique: "MQ", Mauritania: "MR", Mauritius: "MU",
  Mexico: "MX", Micronesia: "FM", Moldova: "MD", Monaco: "MC",
  Mongolia: "MN", Montenegro: "ME", Morocco: "MA", Mozambique: "MZ",
  Myanmar: "MM", Namibia: "NA", Nauru: "NR", Nepal: "NP", Netherlands: "NL",
  "New Zealand": "NZ", Nicaragua: "NI", Niger: "NE", Nigeria: "NG",
  "North Korea": "KP", "North Macedonia": "MK", Norway: "NO", Oman: "OM",
  Pakistan: "PK", Palau: "PW", Palestine: "PS", Panama: "PA",
  "Papua New Guinea": "PG", Paraguay: "PY", Peru: "PE", Philippines: "PH",
  Poland: "PL", Portugal: "PT", Qatar: "QA", Romania: "RO", Russia: "RU",
  Rwanda: "RW", "Saint Kitts and Nevis": "KN", "Saint Lucia": "LC",
  "Saint Vincent and the Grenadines": "VC", Samoa: "WS", "San Marino": "SM",
  "Sao Tome and Principe": "ST", "Saudi Arabia": "SA", Senegal: "SN",
  Serbia: "RS", Seychelles: "SC", "Sierra Leone": "SL", Singapore: "SG",
  Slovakia: "SK", Slovenia: "SI", "Solomon Islands": "SB", Somalia: "SO",
  "South Africa": "ZA", "South Korea": "KR", "South Sudan": "SS",
  Spain: "ES", "Sri Lanka": "LK", Sudan: "SD", Suriname: "SR",
  "Svalbard": "SJ", "Svalbard and Jan Mayen": "SJ",
  Sweden: "SE", Switzerland: "CH", Syria: "SY", Taiwan: "TW",
  Tajikistan: "TJ", Tanzania: "TZ", Thailand: "TH", Togo: "TG",
  Tonga: "TO", "Trinidad and Tobago": "TT", Tunisia: "TN", Turkey: "TR",
  Turkmenistan: "TM", Tuvalu: "TV", Uganda: "UG", Ukraine: "UA",
  "United Arab Emirates": "AE", "United Kingdom": "GB",
  "United States": "US", Uruguay: "UY", Uzbekistan: "UZ",
  Vanuatu: "VU", Vatican: "VA", Venezuela: "VE", Vietnam: "VN",
  Yemen: "YE", Zambia: "ZM", Zimbabwe: "ZW",
};

// Map ISO → hex color
const countryColors = {
  AF: "#CE1126", AL: "#CE1126", DZ: "#006233", AD: "#003893", AO: "#D21034",
  AR: "#74ACDF", AM: "#D90012", AU: "#00247D", AT: "#ED2939", AZ: "#00B3E3",
  BS: "#009CA6", BH: "#B10021", BD: "#006A4E", BB: "#00267F", BY: "#D22730",
  BE: "#FFD90C", BZ: "#003F87", BJ: "#FCD116", BM: "#DA291C", BT: "#FFCC00",
  BO: "#D52B1E", BA: "#002395", BW: "#00AEEF", BR: "#009C3B", BN: "#F7E017",
  BG: "#00966E", BF: "#EF2B2D", BI: "#1EB53A", KH: "#032EA1", CM: "#008751",
  CA: "#FF0000", CV: "#003893", CF: "#003082", TD: "#002664", CL: "#0033A0",
  CN: "#DE2910", CO: "#FCD116", KM: "#3A7728", CG: "#009543", CD: "#007FFF",
  CR: "#002B7F", HR: "#171796", CU: "#002A8F", CY: "#D57800", CZ: "#11457E",
  DK: "#C60C30", DJ: "#4189DD", DM: "#006B3F", DO: "#002D62", EC: "#FCD116",
  EG: "#CE1126", SV: "#19408B", GQ: "#3E9A00", ER: "#4189DD", EE: "#0072CE",
  SZ: "#3E5EB9", ET: "#078930", FJ: "#63B3E4", FI: "#003580", FR: "#0055A4",
  GA: "#009639", GM: "#CE1126", GE: "#FF0000", DE: "#000000", GH: "#FCD116",
  GR: "#0D5EAF", GL: "#C60C30", GD: "#007847", GT: "#4997D0", GN: "#009460",
  GW: "#FFCD00", GY: "#009739", HT: "#00209F", HN: "#0073CF", HU: "#436F4D",
  IS: "#02529C", IN: "#FF9933", ID: "#FF0000", IR: "#239F40", IQ: "#CE1126",
  IE: "#169B62", IL: "#0038B8", IT: "#009246", JM: "#FFD100", JP: "#BC002D",
  JO: "#007847", KZ: "#00AFCA", KE: "#006600", KI: "#D21034", XK: "#244AA5",
  KW: "#007A3D", KG: "#FF0000", LA: "#002868", LV: "#9E3039", LB: "#E70013",
  LS: "#00209F", LR: "#002868", LY: "#239E46", LI: "#002171", LT: "#FDB913",
  LU: "#00A1DE", MG: "#00843D", MW: "#D21034", MY: "#010066", MV: "#D21034",
  ML: "#FCD116", MT: "#CF142B", MH: "#00247D", MQ: "#00267F", MR: "#006233",
  MU: "#EA2839", MX: "#006847", FM: "#75AADB", MD: "#0033A0", MC: "#ED2939",
  MN: "#C4272F", ME: "#D6081B", MA: "#C1272D", MZ: "#009739", MM: "#FECB00",
  NA: "#003580", NR: "#002B7F", NP: "#DC143C", NL: "#FF9933", NZ: "#00247D",
  NI: "#0067C6", NE: "#E05206", NG: "#008751", KP: "#024FA2", MK: "#D20000",
  NO: "#BA0C2F", OM: "#C8102E", PK: "#01411C", PW: "#0085CA", PS: "#007A3D",
  PA: "#005293", PG: "#000000", PY: "#D52B1E", PE: "#D91023", PH: "#0038A8",
  PL: "#DC143C", PT: "#006600", QA: "#8D1B3D", RO: "#002B7F", RU: "#0039A6",
  RW: "#FFD100", KN: "#009739", LC: "#66CCFF", VC: "#009739", WS: "#002B7F",
  SM: "#5EB6E4", ST: "#008751", SA: "#006C35", SN: "#00853F", RS: "#0C4076",
  SC: "#007847", SL: "#1EB53A", SG: "#EF3340", SJ: "#BA0C2F",
  SK: "#0B4EA2", SI: "#005DA4",
  SB: "#215B33", SO: "#4189DD", ZA: "#007847", KR: "#003478", SS: "#078930",
  ES: "#AA151B", LK: "#FFB700", SD: "#E31B23", SR: "#377E3F", SE: "#006AA7",
  CH: "#D52B1E", SY: "#CE1126", TW: "#FE0000", TJ: "#006400", TZ: "#1EB53A",
  TH: "#A51931", TG: "#006A4E", TO: "#C10000", TT: "#CE1126", TN: "#E70013",
  TR: "#E30A17", TM: "#007C2E", TV: "#0198D1", UG: "#FCDC04", UA: "#005BBB",
  AE: "#00732F", GB: "#00247D", US: "#3C3B6E", UY: "#0038A8", UZ: "#1EB53A",
  VU: "#009543", VA: "#FFD700", VE: "#F4D41E", VN: "#DA251D", YE: "#CE1126",
  ZM: "#198A00", ZW: "#006400", PEAK: "#7B6F4B",
  default: "#888888",
};


export default function WorldMapComponent({
  accessToken,
  selectingPoint = false,
  onMapClick = () => { },
  onPoiClick = () => { },
  target,
  flyOnTarget = false,
}) {
  const mapRef = useRef(null);
  const [popupData, setPopupData] = useState(null);
  mapboxgl.accessToken = accessToken;
  const geocoder = mbxGeocoding({ accessToken })

  // 1) Initial load: build map, fetch & draw existing pins
  useEffect(() => {
    if (mapRef.current) return;
    const map = new mapboxgl.Map({
      container: "world-map",
      style: "mapbox://styles/jeroenvanelderen/cmc958dgm006s01shdiu103uz",
      center: [0, 20],
      zoom: 1.5,
      projection: "globe",
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", async () => {
      console.log("Map layers:", map.getStyle().layers.map(l => l.id));

      map.setFog({
        color: "rgb(17,17,17)",
        "high-color": "rgb(17,17,17)",
        "horizon-blend": 0.2,
        "space-color": "rgb(0,0,0)",
        "star-intensity": 0.5,
      }); 

      // fetch existing pins
      const { data: pins } = await supabase.from("pins").select("*, countryName");
      const features = pins.map(pin => ({
        type: "Feature",
        properties: {
          pinId: pin.id,
          title: pin.Name,
          description: pin.Information,
          imageurl: pin["Main Image"],
          date: pin.created_at,
          iso: pin.iso || countryNameToIso[pin.countryName] || "default",
        },
        geometry: {
          type: "Point",
          coordinates: [pin.longitude, pin.latitude],
        },
      }));

      // add or update source
      const src = map.getSource("pins");
      if (src && typeof src.setData === "function") {
        src.setData({ type: "FeatureCollection", features });
      } else {
        map.addSource("pins", {
          type: "geojson",
          data: { type: "FeatureCollection", features },
          cluster: true,
          clusterRadius: 60,
        });
      }

      // register each country icon
      new Set(features.map(f => f.properties.iso)).forEach(iso => {
        const imgId = `marker-${iso}`;
        const hex = countryColors[iso] || countryColors.default;
        const canvas = createMarkerCanvas(hex, iso);
        const imgData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
        if (map.hasImage(imgId)) map.removeImage(imgId);
        map.addImage(imgId, imgData);
      });

      // 🏔️ Explicitly add PEAK icon for mountain markers
      if (!map.hasImage("marker-PEAK")) {
        const peakColor = countryColors["PEAK"] || countryColors.default;
        const canvas = createMarkerCanvas(peakColor, "🏔️");  // or use "PEAK" as label if you prefer
        const ctx = canvas.getContext("2d");
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        map.addImage("marker-PEAK", imgData);
      }


      // cluster icon
      const clusterCanvas = createClusterCanvas("#F18F01");
      const clusterImg = clusterCanvas
        .getContext("2d")
        .getImageData(0, 0, clusterCanvas.width, clusterCanvas.height);
      if (map.hasImage("cluster-icon")) map.removeImage("cluster-icon");
      map.addImage("cluster-icon", clusterImg);

      // layers: clusters, count, unclustered
      ["clusters", "cluster-count", "unclustered-point"].forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      map.addLayer({
        id: "clusters",
        type: "symbol",
        source: "pins",
        filter: ["has", "point_count"],
        layout: {
          "icon-image": "cluster-icon",
          "icon-allow-overlap": true,
          "icon-anchor": "center",
          "icon-size": [
            "step",
            ["get", "point_count"],
            1.2,
            10, 1.5,
            30, 2,
            70, 2.5,
            200, 3,
          ],
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "pins",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: { "text-color": "#fff" },
      });
      map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "pins",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": ["concat", "marker-", ["get", "iso"]],
          "icon-allow-overlap": true,
          "icon-anchor": "bottom",
        },
      });

      // POI labels → open configurator on click
      // POI labels → open configurator on click (place-label → tilequery → OSM)
      const poiLayer = map.getStyle().layers.find(l => l.id.includes("poi-label"));
      if (poiLayer) {
        map.moveLayer(poiLayer.id);
        map.on("click", poiLayer.id, async (e) => {
          const feat = e.features[0];
          const [lng, lat] = e.lngLat.toArray();

          const props = feat.properties || {};
          console.log("🧪 Feature properties:", props);

          const name = props.name_en || props.name || props.text || "";
          const category = props.category || props.subcategory || props.classification || "";
          const natural = props.natural || "";
          const maki = props.maki || "";
          
          // STEP 1: Try to find city from rendered features
          const placeLayerIds = map.getStyle().layers
            .filter(l => l.id.includes("place-label"))
            .map(l => l.id);
          let city = map.queryRenderedFeatures(e.point, { layers: placeLayerIds })[0]
            ?.properties.text || "";

          let address = "";

          if (name) {
            // Try Mapbox forward geocoding first
            try {
              const response = await geocoder.forwardGeocode({
                query: name,
                limit: 1,
                // Optionally, provide country or proximity for better match:
                // countries: ['FR'], // ISO country code if you know
                // proximity: { longitude: lng, latitude: lat },
              }).send();
              if (response.body.features.length > 0) {
                address = response.body.features[0].place_name;
              }
            } catch (err) {
              console.warn("Mapbox forward geocode error:", err);
            }
          }

          if (!address) {
            // Fallback: OSM reverse geocode
            try {
              const osmUrl =
                `https://nominatim.openstreetmap.org/reverse`
                + `?format=json&addressdetails=1`
                + `&lat=${lat}&lon=${lng}`
                + `&zoom=14`;
              const osm = await fetch(osmUrl).then(r => r.json());
              address = osm.display_name || "";
            } catch (err) {
              console.warn("OSM reverse-geocode error:", err);
            }
          }


          // STEP 3: Fallback - OpenStreetMap/Nominatim
          if (!city) {
            try {
              const osmUrl =
                `https://nominatim.openstreetmap.org/reverse`
                + `?format=json&addressdetails=1`
                + `&lat=${lat}&lon=${lng}`
                + `&zoom=14`;
              const osm = await fetch(osmUrl).then(r => r.json());
              const addr = osm.address || {};
              city = addr.village || addr.hamlet || addr.town || addr.city || addr.municipality || addr.county || "";
            } catch (err) {
              console.warn("OSM reverse-geocode error:", err);
            }
          }

          

          console.log("🗻 Checking peak logic...");
          console.log("Natural:", natural);
          console.log("Category:", category);
          console.log("Maki:", maki);

          const isMountainPeak =
            /peak|mountain|hill|ridge|summit/i.test(category) ||
            /peak|mountain|hill|ridge|summit/i.test(natural) ||
            /peak|mountain|hill|ridge|summit/i.test(maki);

          console.log("⛰️ Is mountain peak?", isMountainPeak);


          console.log("Natural:", natural, "Category:", category, "IsMountainPeak:", isMountainPeak);



          // STEP 6: Trigger your POI configurator
          onPoiClick({
            name,
            text: name,
            landmark: name,
            category,
            lat,
            lng,
            city: isMountainPeak ? "" : city,
            iso: isMountainPeak ? "PEAK" : undefined,  // <-- override ISO to use custom color
            address,
          });
        });

      }
      const naturalLayer = map.getStyle().layers.find(l => l.id.includes("natural-point-label"));
      if (naturalLayer) {
        map.moveLayer(naturalLayer.id);

        map.on("click", naturalLayer.id, async (e) => {
          console.log("🟢 Click detected on natural-point-label");

          const feat = e.features[0];
          console.log("📦 Raw feature:", feat);

          const props = feat.properties || {};
          console.log("🧪 Feature properties:", props);

          const name = props.name_en || props.name || props.text || "";
          const category = props.category || props.subcategory || props.classification || "";
          const natural = props.natural || "";
          const maki = props.maki || "";

          console.log("🗻 Checking peak logic...");
          console.log("Natural:", natural);
          console.log("Category:", category);
          console.log("Maki:", maki);

          const isMountainPeak =
            /peak|mountain|hill|ridge|summit/i.test(category) ||
            /peak|mountain|hill|ridge|summit/i.test(natural) ||
            /peak|mountain|hill|ridge|summit/i.test(maki);

          console.log("⛰️ Is mountain peak?", isMountainPeak);

          const [lng, lat] = e.lngLat.toArray();

          let city = "";
          let address = "";
          if (!isMountainPeak) {
            console.log("🌍 Fetching city via OSM reverse geocoding...");
            try {
              const osmUrl =
                `https://nominatim.openstreetmap.org/reverse`
                + `?format=json&addressdetails=1`
                + `&lat=${lat}&lon=${lng}`
                + `&zoom=14`;

              const osm = await fetch(osmUrl).then(r => r.json());
              const addr = osm.address || {};

              console.log("📬 OSM address result:", addr);

              city = addr.village || addr.hamlet || addr.town || addr.city || addr.municipality || addr.county || "";
              address = osm.display_name || "";
              console.log("🏙️ Extracted city:", city);
            } catch (err) {
              console.warn("⚠️ OSM reverse-geocode error:", err);
            }
          } else {
            console.log("⛰️ Skipping city lookup for mountain peak");
          }

          const finalPoi = {
            name,
            text: name,
            landmark: name,
            category,
            lat,
            lng,
            city: isMountainPeak ? "" : city,
            iso: isMountainPeak ? "PEAK" : undefined,
            address,
          };

          console.log("✅ Final POI:", finalPoi);

          onPoiClick(finalPoi);
        });
      }




      // cluster expansion on click
      map.on("click", "clusters", e => {
        const clusterId = e.features[0].properties.cluster_id;
        const src = map.getSource("pins");
        if (src && typeof src.getClusterExpansionZoom === "function") {
          src.getClusterExpansionZoom(clusterId, (err, z) => {
            if (!err) map.easeTo({ center: e.lngLat, zoom: z });
          });
        }

      });

      // show popup for single point
      map.on("click", "unclustered-point", e => {
        const feat = e.features[0];
        const [lng, lat] = feat.geometry.coordinates;
        const p = feat.properties;
        setPopupData({
          title: p.title,
          description: p.description,
          imageurl: p.imageurl,
          date: p.date,
          longitude: lng,
          latitude: lat,
          countryName: p.countryName,
        });
      });
    });

    return () => {
      if (mapRef.current && typeof mapRef.current.remove === "function") {
        mapRef.current.remove();
      }
      mapRef.current = null;
    };
  }, [accessToken]);

  // 2) POLLING (only update on new pins)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    let renderedPinIds = new Set();

    const fetchPins = async () => {
      const { data: pins, error } = await supabase.from("pins").select("*, countryName").order("created_at", { ascending: true });
      if (error || !pins) return;

      const currentPinIds = new Set(pins.map(p => p.id));

      // Only update if there's any new pin
      let isNew = false;
      for (let id of currentPinIds) {
        if (!renderedPinIds.has(id)) {
          isNew = true;
          break;
        }
      }

      if (!isNew) return;

      // Update map and cache IDs
      renderedPinIds = currentPinIds;

      const features = pins.map(pin => ({
        type: "Feature",
        properties: {
          pinId: pin.id,
          title: pin.Name,
          description: pin.Information,
          imageurl: pin["Main Image"],
          date: pin.created_at,
          iso: pin.iso || countryNameToIso[pin.countryName] || "default",
          countryName: pin.countryName,
        },
        geometry: {
          type: "Point",
          coordinates: [pin.longitude, pin.latitude],
        },
      }));

      // Register any new marker icons
      const existingImageIds = map.listImages();
      new Set(features.map(f => f.properties.iso)).forEach(iso => {
        const imgId = `marker-${iso}`;
        if (!existingImageIds.includes(imgId)) {
          const hex = countryColors[iso] || countryColors.default;
          const canvas = createMarkerCanvas(hex, iso);
          const imgData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
          map.addImage(imgId, imgData);
        }
      });

      const src = map.getSource("pins");
      if (src) {
        src.setData({ type: "FeatureCollection", features });
      }
    };

    fetchPins();
    const interval = setInterval(fetchPins, 5000);

    return () => clearInterval(interval);
  }, []);


  // 3) Click-to-select-point handler
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const cb = e => {
      if (selectingPoint) {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    };

    map.on("click", cb);

    return () => {
      if (map && typeof map.off === "function") {
        map.off("click", cb);
      }
    };
  }, [selectingPoint, onMapClick]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div id="world-map" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }} />
      {popupData && <PopupComponent data={popupData} onClose={() => setPopupData(null)} />}
    </div>
  );
}
