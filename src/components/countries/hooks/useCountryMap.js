import { useMemo, useCallback, useState } from "react";
import { countryNameToIso } from "utils/countryColors";
import bbox from "@turf/bbox";

const normalize = (s) =>
  String(s || "").trim().toLowerCase().replace(/[^a-z]/g, "");

export function useCountryMap(allPins) {
  const geoJsonPins = useMemo(() => {
    return (allPins || [])
      .filter((p) => p.latitude && p.longitude)
      .map((p) => {
        const key = Object.keys(countryNameToIso).find(
          (k) => normalize(k) === normalize(p.countryName)
        );
        const iso = countryNameToIso[p.countryName] || countryNameToIso[key] || "default";

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              parseFloat(p.longitude),
              parseFloat(p.latitude),
            ],
          },
          properties: {
            ...p,
            iso,
          },
        };
      });
  }, [allPins]);

  const bounds = useMemo(() => {
    if (!geoJsonPins.length) return;
    const [minLng, minLat, maxLng, maxLat] = bbox({
      type: "FeatureCollection",
      features: geoJsonPins,
    });
    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ];
  }, [geoJsonPins]);

  const [selectedPinId, setSelectedPinId] = useState(null);
  const filtered = useMemo(
    () =>
      selectedPinId
        ? geoJsonPins.filter((f) => f.properties.id === selectedPinId)
        : geoJsonPins,
    [geoJsonPins, selectedPinId]
  );
  const onPoiClick = useCallback((id) => setSelectedPinId(id), []);
  const reset = useCallback(() => setSelectedPinId(null), []);

  return {
    pins: filtered,
    bounds,
    onPoiClick,
    resetPinsFilter: reset,
  };
}
