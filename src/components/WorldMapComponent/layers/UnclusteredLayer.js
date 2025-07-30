import { useEffect } from "react";

export default function UnclusteredLayer({ map, features }) {
  useEffect(() => {
    if (
      !map ||                             // no map yet
      !map.getSource("pins") ||           // source not created
      map.getLayer("unclustered-point")   // already added
    ) {
      return;
    }

    // make sure **all** of your marker‑<ISO> icons are registered
    const isos = [...new Set(features.map(f => f.properties.iso))];
    const allImagesRegistered = isos.every(iso =>
      map.hasImage(`marker-${iso}`)
    );
    if (!allImagesRegistered) {
      return;
    }

    console.log("[worldmap] ➡️ Adding unclustered‑point layer now", features);

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
  }, [map, features]);

  return null;
}
