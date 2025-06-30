import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Supercluster from "supercluster";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "../SupabaseClient";
import PopupComponent from "./PopupComponent";
import "./WorldMapComponent.css";

// Convert "#RRGGBB" → "R,G,B"
function hexToRgbString(hex) {
  const match = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!match) return "0,0,0";
  return [
    parseInt(match[1], 16),
    parseInt(match[2], 16),
    parseInt(match[3], 16),
  ].join(",");
}

const WorldMapComponent = ({
  accessToken,
  selectingPoint = false,
  onMapClick = () => {},
  onPoiClick = () => {},
  target,
  flyOnTarget = false,
}) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const superclusterRef = useRef(null);
  const selectedPoiMarkerRef = useRef(null);
  const [popupData, setPopupData] = useState(null);

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
    AF: "#0072C6", AL: "#E41E20", DZ: "#006233", AD: "#003893", AO: "#D21034",
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
    IE: "#169B62", IL: "#0038B8", IT: "#008C45", JM: "#FFD100", JP: "#BC002D",
    JO: "#007847", KZ: "#00AFCA", KE: "#006600", KI: "#D21034", XK: "#244AA5",
    KW: "#007A3D", KG: "#FF0000", LA: "#002868", LV: "#9E3039", LB: "#E70013",
    LS: "#00209F", LR: "#002868", LY: "#239E46", LI: "#002171", LT: "#FDB913",
    LU: "#00A1DE", MG: "#00843D", MW: "#D21034", MY: "#010066", MV: "#D21034",
    ML: "#FCD116", MT: "#CF142B", MH: "#00247D", MQ: "#00267F", MR: "#006233",
    MU: "#EA2839", MX: "#006847", FM: "#75AADB", MD: "#0033A0", MC: "#ED2939",
    MN: "#C4272F", ME: "#D6081B", MA: "#C1272D", MZ: "#009739", MM: "#FECB00",
    NA: "#003580", NR: "#002B7F", NP: "#DC143C", NL: "#21468B", NZ: "#00247D",
    NI: "#0067C6", NE: "#E05206", NG: "#008751", KP: "#024FA2", MK: "#D20000",
    NO: "#BA0C2F", OM: "#C8102E", PK: "#01411C", PW: "#0085CA", PS: "#007A3D",
    PA: "#005293", PG: "#000000", PY: "#D52B1E", PE: "#D91023", PH: "#0038A8",
    PL: "#DC143C", PT: "#006600", QA: "#8D1B3D", RO: "#002B7F", RU: "#0039A6",
    RW: "#FFD100", KN: "#009739", LC: "#66CCFF", VC: "#009739", WS: "#002B7F",
    SM: "#5EB6E4", ST: "#008751", SA: "#006C35", SN: "#00853F", RS: "#0C4076",
    SC: "#007847", SL: "#1EB53A", SG: "#EF3340", SK: "#0B4EA2", SI: "#005DA4",
    SB: "#215B33", SO: "#4189DD", ZA: "#007847", KR: "#003478", SS: "#078930",
    ES: "#AA151B", LK: "#FFB700", SD: "#E31B23", SR: "#377E3F", SE: "#006AA7",
    CH: "#D52B1E", SY: "#CE1126", TW: "#FE0000", TJ: "#006400", TZ: "#1EB53A",
    TH: "#A51931", TG: "#006A4E", TO: "#C10000", TT: "#CE1126", TN: "#E70013",
    TR: "#E30A17", TM: "#007C2E", TV: "#0198D1", UG: "#FCDC04", UA: "#005BBB",
    AE: "#00732F", GB: "#00247D", US: "#3C3B6E", UY: "#0038A8", UZ: "#1EB53A",
    VU: "#009543", VA: "#FFD700", VE: "#F4D41E", VN: "#DA251D", YE: "#CE1126",
    ZM: "#198A00", ZW: "#006400",
    default: "#888888",
  };
  const getCountryColor = (iso) => countryColors[iso] || countryColors.default;

  mapboxgl.accessToken = accessToken;

  useEffect(() => {
    if (mapRef.current) return;
    const map = new mapboxgl.Map({
      container: "world-map",
      style: "mapbox://styles/jeroenvanelderen/cmc958dgm006s01shdiu103uz",
      center: [0, 20], zoom: 1.5, projection: "globe", attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", async () => {
      map.setFog({ color: "rgb(17,17,17)", "high-color": "rgb(17,17,17)", "horizon-blend": 0.2,
        "space-color": "rgb(0,0,0)", "star-intensity": 0.5 });
      map.addSource("country-boundaries", { type: "vector", url: "mapbox://mapbox.country-boundaries-v1" });
      map.addLayer({ id: "country-fill", type: "fill", source: "country-boundaries",
        "source-layer": "country_boundaries", paint: { "fill-color": "#627BC1", "fill-opacity": 0 }});
      map.addLayer({ id: "country-border", type: "line", source: "country-boundaries",
        "source-layer": "country_boundaries", paint: { "line-color": "#fff !important", "line-width": 1.5 }});

      await loadPinsAndCluster(map);
      updateMarkers(map);
      map.on("moveend", () => updateMarkers(map));

      const handlePoiClick = async (e) => {
        if (!e.features?.length) return;
        const feat = e.features[0];
        const { lng, lat } = e.lngLat;
        if (selectedPoiMarkerRef.current) selectedPoiMarkerRef.current.remove();
        selectedPoiMarkerRef.current = new mapboxgl.Marker({ color: "#888888" })
          .setLngLat([lng, lat]).addTo(map);
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&types=poi,place,region,country,address&limit=1`);
        const { features } = await res.json();
        const primary = features[0] || {};
        let city = primary.context?.find(c => c.id.startsWith("place"))?.text || "";
        if (!city) {
          const cityJson = await (await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&types=place&limit=1`)).json();
          city = cityJson.features[0]?.text || "";
        }
        const country = primary.context?.find(c => c.id.startsWith("country"))?.text || "";
        onPoiClick({ lat, lng, text: feat.text, name: feat.properties.name, landmark: feat.properties.name || feat.text || "Unnamed POI", city, country });
      };
      ["poi-label","natural-point-label"].forEach(layerId => {
        const attach = () => {
          map.on("click", layerId, handlePoiClick);
          map.on("mouseenter", layerId, () => map.getCanvas().style.cursor = "pointer");
          map.on("mouseleave", layerId, () => map.getCanvas().style.cursor = "");
        };
        if (map.getLayer(layerId)) attach(); else map.on("styledata", () => { if (map.getLayer(layerId)) attach(); });
      });
    });

    return () => { if (selectedPoiMarkerRef.current) selectedPoiMarkerRef.current.remove(); map.remove(); mapRef.current = null; };
  }, [accessToken]);

  useEffect(() => { if (mapRef.current && flyOnTarget && Array.isArray(target)) mapRef.current.flyTo({ center: target, zoom: 12, speed: 1.2, curve: 1.4 }); }, [target, flyOnTarget]);
  useEffect(() => { const map = mapRef.current; if (!map) return; const handler = e => { if (!selectingPoint) return; onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat }); }; map.on("click", handler); return () => map.off("click", handler); }, [selectingPoint, onMapClick]);

  const loadPinsAndCluster = async (map) => {
    const { data: pins, error } = await supabase.from("pins").select("*");
    if (error) return console.error("Error loading pins:", error);
    const features = pins.map(pin => ({ type: "Feature", properties: { cluster: false, pinId: pin.id, title: pin.Name || "No title", description: pin.Information || "No description", imageurl: pin["Main Image"] || "", date: pin.created_at, countryName: pin.countryName || "default" }, geometry: { type: "Point", coordinates: [pin.longitude, pin.latitude] }}));
    superclusterRef.current = new Supercluster({ radius: 60, maxZoom: 16 });
    superclusterRef.current.load(features);
  };

  const clearMarkers = () => { markersRef.current.forEach(m => m.remove()); markersRef.current = []; };

  const updateMarkers = (map) => {
    if (!superclusterRef.current) return;
    clearMarkers();
    const bounds = map.getBounds().toArray().flat();
    const zoom = Math.floor(map.getZoom());
    const clusters = superclusterRef.current.getClusters(bounds, zoom);

    clusters.forEach(cluster => {
      const [lng, lat] = cluster.geometry.coordinates;
      if (cluster.properties.cluster) {
        // Cluster, NO tail!
        const color = "#F18F01";
        const rgb = hexToRgbString(color);
        const strong = `rgba(${rgb},0.85)`;
        const soft = `rgba(${rgb},0.7)`;
        const el = document.createElement("div");
        el.style.cssText = `
          background: linear-gradient(145deg, ${strong} 0%, ${soft} 100%);
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: inset 0 0 10px rgba(255,255,255,0.4), 0 0 12px ${soft};
          backdrop-filter: blur(12px);
          border-radius: 50%;
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: bold; cursor: pointer;
        `;
        el.innerText = cluster.properties.point_count;
        el.addEventListener("click", () => {
          const expZoom = superclusterRef.current.getClusterExpansionZoom(cluster.properties.cluster_id);
          map.easeTo({ center: [lng, lat], zoom: Math.min(expZoom, 20) });
        });
        // Cluster marker, anchor center
        const marker = new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat([lng, lat]).addTo(map);
        markersRef.current.push(marker);
      } else {
        // Single marker: add TAIL
        const iso = countryNameToIso[cluster.properties.countryName] || "default";
        const baseHex = getCountryColor(iso);
        const rgbString = hexToRgbString(baseHex);
        const strong = `rgba(${rgbString},0.85)`;
        const soft = `rgba(${rgbString},0.7)`;

        // Create marker container
        const container = document.createElement("div");
        container.style.cssText = `
          position: relative;
          width: 30px; height: 40px; /* marker height + tail height */
          display: flex; flex-direction: column; align-items: center; pointer-events: auto;
        `;

        // Bubble
        const bubble = document.createElement("div");
        bubble.style.cssText = `
          background: linear-gradient(145deg, ${strong} 0%, ${soft} 100%);
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: inset 0 0 10px rgba(255,255,255,0.4), 0 0 12px ${soft};
          backdrop-filter: blur(12px);
          border-radius: 50%;
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.6rem; cursor: pointer;
          position: relative;
          z-index: 2;
        `;
        bubble.innerText = iso;

        // Tail
        const tail = document.createElement("div");
        tail.style.cssText = `
          width: 0; height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 10px solid ${strong};
          margin-top: -2px;
          filter: blur(0.3px);
          opacity: 0.85;
          z-index: 1;
        `;

        container.appendChild(bubble);
        container.appendChild(tail);

        // Anchor is "bottom" so the tip is at (lng,lat)
        const marker = new mapboxgl.Marker({ element: container, anchor: "bottom" })
          .setLngLat([lng, lat]).addTo(map);

        bubble.addEventListener("click", e => {
          e.preventDefault(); e.stopPropagation();
          setPopupData({
            title: cluster.properties.title,
            description: cluster.properties.description,
            imageurl: cluster.properties.imageurl,
            date: cluster.properties.date,
            longitude: lng,
            latitude: lat,
            countryName: cluster.properties.countryName
          });
        });
        markersRef.current.push(marker);
      }
    });
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div id="world-map" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }} />
      {popupData && <PopupComponent data={popupData} onClose={() => setPopupData(null)} />}
    </div>
  );
};

export default WorldMapComponent;
