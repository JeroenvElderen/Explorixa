import { useEffect } from "react";
import { createMarkerCanvas } from "./MarkersIcons";

// Normalize country names
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
    Czechia: "Czech Republic",
    UAE: "United Arab Emirates",
    "Palestinian Territories": "Palestine",
    "Vatican City": "Vatican",
    "Ivory Coast": "Côte d'Ivoire",
  };
  return map[name] || name;
};

export function useMapPolling(mapRef, supabase, countryNameToIso, countryColors) {
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    let renderedPinIds = new Set();

    const fetchPins = async () => {
      const { data: pins, error } = await supabase
        .from("pins")
        .select("*, countryName")
        .order("created_at", { ascending: true });

      if (error || !pins) return;

      const currentPinIds = new Set(pins.map((p) => p.id));

      let isNew = false;
      for (let id of currentPinIds) {
        if (!renderedPinIds.has(id)) {
          isNew = true;
          break;
        }
      }

      if (!isNew) return;
      renderedPinIds = currentPinIds;

      const features = pins.map((pin) => {
        const normalized = normalizeCountryName(pin.countryName);
        const iso = pin.iso || countryNameToIso[normalized] || "default";

        return {
          type: "Feature",
          properties: {
            pinId: pin.id,
            title: pin.Name,
            description: pin.Information,
            imageurl: pin["Main Image"],
            date: pin.created_at,
            iso,
            countryName: pin.countryName,
          },
          geometry: {
            type: "Point",
            coordinates: [pin.longitude, pin.latitude],
          },
        };
      });

      const existingImageIds = map.listImages();
      new Set(features.map((f) => f.properties.iso)).forEach((iso) => {
        const imgId = `marker-${iso}`;
        const hex = countryColors[iso] || countryColors.default || "#888888";

        if (!existingImageIds.includes(imgId)) {
          const canvas = createMarkerCanvas(hex, iso);
          const ctx = canvas.getContext("2d");
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
  }, [mapRef, supabase, countryNameToIso, countryColors]);
}
