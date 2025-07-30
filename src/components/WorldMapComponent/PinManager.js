import { createMarkerCanvas, createClusterCanvas } from "./MarkersIcons";

// Country name normalization
const normalizeCountryName = (name) => {
  if (!name) return null;

  const map = {
    USA: "United States",
    US: "United States",
    UK: "United Kingdom",
    "S. Korea": "South Korea",
    "N. Korea": "North Korea",
    "DR Congo": "Democratic Republic of Congo",
    "Republic of the Congo": "Congo",
    "Czechia": "Czech Republic",
    "UAE": "United Arab Emirates",
    "Palestinian Territories": "Palestine",
    "Vatican City": "Vatican",
    "Ivory Coast": "Côte d'Ivoire",
  };

  return map[name] || name;
};

export async function setupPins(map, supabase, countryNameToIso, countryColors) {
  const { data: pins } = await supabase.from("pins").select("*, countryName");

  const features = pins.map((pin) => {
    const normalizedName = normalizeCountryName(pin.countryName);
    const iso = pin.iso || countryNameToIso[normalizedName] || "default";

    return {
      type: "Feature",
      properties: {
        pinId: pin.id,
        title: pin.Name,
        description: pin.Information,
        imageurl: pin["Main Image"],
        date: pin.created_at,
        iso,
      },
      geometry: {
        type: "Point",
        coordinates: [pin.longitude, pin.latitude],
      },
    };
  });

  const source = map.getSource("pins");
  const data = { type: "FeatureCollection", features };

  if (source && typeof source.setData === "function") {
    source.setData(data);
  } else {
    map.addSource("pins", {
      type: "geojson",
      data,
      cluster: true,
      clusterRadius: 60,
    });
  }

  // Marker icons
  new Set(features.map(f => f.properties.iso)).forEach(iso => {
    const imgId = `marker-${iso}`;
    const hex = countryColors[iso] || countryColors.default || "#888888";
    const canvas = createMarkerCanvas(hex, iso);
    const imgData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    if (map.hasImage(imgId)) map.removeImage(imgId);
    map.addImage(imgId, imgData);
  });

  // Cluster icon
  const clusterCanvas = createClusterCanvas("#F18F01");
  const clusterImg = clusterCanvas
    .getContext("2d")
    .getImageData(0, 0, clusterCanvas.width, clusterCanvas.height);
  if (map.hasImage("cluster-icon")) map.removeImage("cluster-icon");
  map.addImage("cluster-icon", clusterImg);

  // Add cluster layers
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
}
