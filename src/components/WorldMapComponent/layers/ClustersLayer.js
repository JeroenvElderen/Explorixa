import { useEffect } from "react";

export default function ClustersLayer({ map, imageId }) {
  useEffect(() => {
    if (
      !map ||                          // no map yet
      !map.getSource("pins") ||        // source not created
      !map.hasImage(imageId) ||        // cluster icon not registered
      map.getLayer("clusters")         // already added
    ) {
      return;
    }

    map.addLayer({
      id: "clusters",
      type: "symbol",
      source: "pins",
      filter: ["has", "point_count"],
      layout: {
        "icon-image": imageId,
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
  }, [map, imageId]);

  return null;
}
