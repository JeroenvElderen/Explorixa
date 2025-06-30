import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Supercluster from "supercluster";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "../SupabaseClient";
import PopupComponent from "./PopupComponent";
import "./WorldMapComponent.css";


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

// Convert hex to [r,g,b]
function hexToRgb(hex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  return m
    ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
    : [136, 136, 136];
}

const WorldMapComponent = ({
  accessToken,
  selectingPoint = false,
  onMapClick = () => {},
  target,
  flyOnTarget = false,
}) => {
  const mapRef = useRef(null);
  const [popupData, setPopupData] = useState(null);
  const superclusterRef = useRef(null);

  mapboxgl.accessToken = accessToken;

  // Load Supabase pins into Supercluster
  const loadData = async () => {
    const { data: pins, error } = await supabase.from("pins").select("*");
    if (error) return console.error(error);
    const features = pins.map((pin) => {
      const iso = countryNameToIso[pin.countryName] || "default";
      const [r, g, b] = hexToRgb(countryColors[iso]);
      return {
        type: "Feature",
        properties: { cluster: false, pinId: pin.id, iso, r, g, b, data: pin },
        geometry: { type: "Point", coordinates: [pin.longitude, pin.latitude] },
      };
    });
    superclusterRef.current = new Supercluster({ radius: 60, maxZoom: 16 });
    superclusterRef.current.load(features);
  };

  // Build/update GeoJSON + layers
  const updateLayer = (map) => {
    if (!superclusterRef.current) return;
    const bounds = map.getBounds().toArray().flat();
    const zoom = Math.floor(map.getZoom());
    const clusters = superclusterRef.current.getClusters(bounds, zoom);

    const features = clusters.map((cluster) => {
      const [lng, lat] = cluster.geometry.coordinates;
      if (cluster.properties.cluster) {
        // Cluster
        const [r, g, b] = hexToRgb("#F18F01");
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: {
            cluster: true,
            clusterId: cluster.properties.cluster_id,
            count: cluster.properties.point_count,
            r,
            g,
            b,
          },
        };
      } else {
        // Single
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: {
            cluster: false,
            pinId: cluster.properties.pinId,
            iso: cluster.properties.iso,
            r: cluster.properties.r,
            g: cluster.properties.g,
            b: cluster.properties.b,
            data: cluster.properties.data,
          },
        };
      }
    });

    const geojson = { type: "FeatureCollection", features };

    if (map.getSource("pins")) {
      map.getSource("pins").setData(geojson);
    } else {
      map.addSource("pins", { type: "geojson", data: geojson });
      // circle layer
      map.addLayer({
        id: "pins-circles",
        type: "circle",
        source: "pins",
        paint: {
          // use rgb channels and separate opacity
          "circle-color": ["rgb", ["to-number", ["get", "r"]], ["to-number", ["get", "g"]], ["to-number", ["get", "b"]]],
          "circle-opacity": 0.85,
          "circle-stroke-color": "rgba(255,255,255,0.4)",
          "circle-stroke-width": 1.5,
          "circle-blur": 0.3,
          "circle-radius": ["case", ["get", "cluster"], 25, 15],
        },
      });
      // label layer
      map.addLayer({
        id: "pins-labels",
        type: "symbol",
        source: "pins",
        layout: {
          "text-field": [
            "case",
            ["get", "cluster"],
            ["to-string", ["get", "count"]],
            ["get", "iso"],
          ],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": ["case", ["get", "cluster"], 14, 10],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: { "text-color": "#fff" },
      });
      // interactions
      map.on("click", "pins-circles", (e) => {
        const p = e.features[0].properties;
        const [lng, lat] = e.features[0].geometry.coordinates;
        if (p.cluster) {
          const nz = superclusterRef.current.getClusterExpansionZoom(p.clusterId);
          map.easeTo({ center: [lng, lat], zoom: Math.min(nz, 20) });
        } else {
          setPopupData({ ...p, longitude: lng, latitude: lat });
        }
      });
      map.on("mouseenter", "pins-circles", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "pins-circles", () => (map.getCanvas().style.cursor = ""));
    }
  };

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
      map.setFog({
        color: "rgb(17,17,17)",
        "high-color": "rgb(17,17,17)",
        "horizon-blend": 0.2,
        "space-color": "rgb(0,0,0)",
        "star-intensity": 0.5,
      });
      map.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });
      map.addLayer({
        id: "country-fill",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        paint: { "fill-color": "#627BC1", "fill-opacity": 0 },
      });
      map.addLayer({
        id: "country-border",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        paint: { "line-color": "#fff", "line-width": 1.5 },
      });
      await loadData();
      updateLayer(map);
      map.on("moveend", () => updateLayer(map));
    });
    return () => map.remove();
  }, [accessToken]);

  // fly to target
  useEffect(() => {
    if (mapRef.current && flyOnTarget && Array.isArray(target)) {
      mapRef.current.flyTo({ center: target, zoom: 12, speed: 1.2, curve: 1.4 });
    }
  }, [target, flyOnTarget]);

  // click-to-pick-point
  useEffect(() => {
    if (!mapRef.current || !selectingPoint) return;
    const handler = (e) => onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    mapRef.current.on("click", handler);
    return () => mapRef.current.off("click", handler);
  }, [selectingPoint]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        id="world-map"
        style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
      />
      {popupData && <PopupComponent data={popupData} onClose={() => setPopupData(null)} />}
    </div>
  );
};

export default WorldMapComponent;
