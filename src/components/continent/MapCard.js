// src/components/continent/MapCard.js

import React, {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  memo,
} from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import MapContainer from "./MapContainer";
import PoiClickHandler from "components/WorldMapComponent/layers/PoiClickHandler";
import { createClusterCanvas } from "components/WorldMapComponent/marker/createClusterCanvas";
import continentsGeoJSON from "utils/continents.json";

const CLUSTER_ICON_ID = "cluster-icon";

const MapCard = forwardRef(function MapCard(
  {
    pins,
    accessToken,
    onPoiClick = () => {},
    initialBounds = null,
    highlightContinent = null,
    height = 320,
    onLoad = () => {},
  },
  ref
) {
  const [map, setMap] = useState(null);

  // expose imperative API
  useImperativeHandle(
    ref,
    () => ({
      flyTo: (lngLat, zoom) => map?.flyTo({ center: [lngLat.lng, lngLat.lat], zoom }),
    }),
    [map]
  );

  const handleLoad = useCallback(
    (m) => {
      setMap(m);
      onLoad();

      // ── Phase 1: show bare pins as circles immediately ──
      if (initialBounds) {
        m.fitBounds(initialBounds, { padding: 20, maxZoom: 4, duration: 0 });
      }

      // add GeoJSON source
      m.addSource("pins", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // temporary circle layer for instant feedback
      if (!m.getLayer("unclustered-circle")) {
        m.addLayer({
          id: "unclustered-circle",
          type: "circle",
          source: "pins",
          paint: {
            "circle-radius": 6,
            "circle-color": "#f18f01",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }

      // ── Phase 2: deferred heavy layers ──
      const addHeavy = () => {
        // remove temporary circle layer
        if (m.getLayer("unclustered-circle")) {
          m.removeLayer("unclustered-circle");
        }

        const src = m.getSource("pins");
        if (!src) return;
        // enable clustering
        src.cluster = true;
        src.clusterRadius = 60;

        // add cluster icon
        if (m.hasImage(CLUSTER_ICON_ID)) m.removeImage(CLUSTER_ICON_ID);
        const cc = createClusterCanvas("#f18f01");
        m.addImage(
          CLUSTER_ICON_ID,
          cc.getContext("2d").getImageData(0, 0, cc.width, cc.height)
        );

        const firstSym = m.getStyle().layers.find((l) => l.type === "symbol")?.id;

        // clusters layer
        if (!m.getLayer("clusters")) {
          m.addLayer(
            {
              id: "clusters",
              type: "symbol",
              source: "pins",
              filter: ["has", "point_count"],
              layout: {
                "icon-image": CLUSTER_ICON_ID,
                "icon-allow-overlap": true,
                "icon-anchor": "center",
                "icon-size": [
                  "step",
                  ["get", "point_count"],
                  1.2,
                  10,
                  1.5,
                  30,
                  2,
                  70,
                  2.5,
                  200,
                  3,
                ],
              },
            },
            firstSym
          );
        }

        // cluster count
        if (!m.getLayer("cluster-count")) {
          m.addLayer(
            {
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
              paint: { "text-color": "#ffffff" },
            },
            firstSym
          );
        }

        // unclustered-point symbols
        if (!m.getLayer("unclustered-point")) {
          m.addLayer(
            {
              id: "unclustered-point",
              type: "symbol",
              source: "pins",
              filter: ["!", ["has", "point_count"]],
              layout: {
                "icon-image": ["concat", "marker-", ["get", "iso"]],
                "icon-allow-overlap": true,
                "icon-anchor": "bottom",
              },
            },
            firstSym
          );
        }

        // continent outline
        if (highlightContinent) {
          const feat = continentsGeoJSON.features.find(
            (f) =>
              f.properties.CONTINENT?.toLowerCase() ===
              highlightContinent.toLowerCase()
          );
          if (feat && !m.getSource("continent-outline")) {
            m.addSource("continent-outline", { type: "geojson", data: feat });
            m.addLayer({
              id: "continent-outline",
              type: "line",
              source: "continent-outline",
              paint: { "line-color": "#f18f01", "line-width": 3 },
            });
          }
        }
      };

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(addHeavy, { timeout: 200 });
      } else {
        setTimeout(addHeavy, 0);
      }
    },
    [initialBounds, highlightContinent, onLoad]
  );

  // update pins on the source
  useEffect(() => {
    if (!map) return;
    const src = map.getSource("pins");
    if (!src) return;
    const features = pins.map((p) => ({
      type: "Feature",
      geometry: p.geometry,
      properties: p.properties,
    }));
    src.setData({ type: "FeatureCollection", features });
  }, [map, pins]);

  // click to callback
  useEffect(() => {
    if (!map) return;
    const handler = (e) => {
      const pid = e.features[0]?.properties.pinId;
      if (pid) onPoiClick(pid);
    };
    map.on("click", "unclustered-point", handler);
    map.getCanvas().style.cursor = "pointer";
    return () => {
      map.off("click", "unclustered-point", handler);
      map.getCanvas().style.cursor = "";
    };
  }, [map, onPoiClick]);

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height,
      }}
    >
      <CardContent
        sx={{ p: 0, position: "relative", display: "flex", flex: 1 }}
      >
        <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
          <MapContainer
            accessToken={accessToken}
            onLoad={handleLoad}
            fullScreen={false}
            style={{ position: "absolute", inset: 0, height }}
          />
          <PoiClickHandler
            map={map}
            accessToken={accessToken}
            onPoiClick={onPoiClick}
          />
        </Box>
      </CardContent>
    </Card>
  );
});

MapCard.propTypes = {
  pins: PropTypes.array.isRequired,
  accessToken: PropTypes.string.isRequired,
  onPoiClick: PropTypes.func,
  initialBounds: PropTypes.array,
  highlightContinent: PropTypes.string,
  height: PropTypes.number,
  onLoad: PropTypes.func,
};

export default memo(MapCard);
