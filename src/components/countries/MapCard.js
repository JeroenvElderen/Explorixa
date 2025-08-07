// src/components/WorldMapComponent/MapCard.jsx
import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import PropTypes from "prop-types";
import MapContainer from "./MapContainer";
import { createClient } from "@supabase/supabase-js";
import { getClusterIcon, getMarkerImage } from "./marker/markerManager";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

const CLUSTER_ICON_ID = "cluster-icon";

function isValidBounds(bounds) {
  return (
    Array.isArray(bounds) &&
    bounds.length === 2 &&
    bounds.every(
      (pt) =>
        Array.isArray(pt) &&
        pt.length === 2 &&
        pt.every((n) => typeof n === "number" && isFinite(n))
    )
  );
}

const MapCard = forwardRef(function MapCard(
  {
    countryName,
    pins = [],
    accessToken,
    initialBounds = null,
    height = 520,
    resetPinsFilter = () => {},
    selectedPinId = null,
  },
  ref
) {
  const [map, setMap] = useState(null);
  const sourceRef = useRef(null);
  const isUserInteracting = useRef(false);
  const lastPinsJson = useRef("");
  const pendingFrame = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      flyTo(lngLat, zoom = 5) {
        map?.flyTo({ center: [lngLat.lng, lngLat.lat], zoom });
      },
      getMap: () => map,
    }),
    [map]
  );

  const handleLoad = useCallback(
    (m) => {
      m.once("load", async () => {
        setMap(m);

        // Hide Mapbox's admin-0 boundaries
        m.getStyle().layers
          .filter((l) => l.id.startsWith("admin-0-boundary"))
          .forEach((l) => m.setLayoutProperty(l.id, "visibility", "none"));

        // 1) Pins source
        if (!m.getSource("pins")) {
          m.addSource("pins", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
            cluster: true,
            clusterRadius: 60,
          });
        }
        const src = m.getSource("pins");
        if (!src) {
          console.error("Failed to register 'pins' source");
          return;
        }
        sourceRef.current = src;

        // 2) Cluster icon
        if (m.hasImage(CLUSTER_ICON_ID)) m.removeImage(CLUSTER_ICON_ID);
        m.addImage(CLUSTER_ICON_ID, getClusterIcon());

        // 3) Default marker
        const defaultKey = "marker-default";
        if (!m.hasImage(defaultKey)) {
          m.addImage(defaultKey, getMarkerImage("default"));
        }

        // 4) Country outline
        const styleLayers = m.getStyle().layers || [];
        const firstSymbol = styleLayers.find((l) => l.type === "symbol")?.id;

        if (countryName) {
          const { data, error } = await supabase
            .from("countries_poly")
            .select("geojson")
            .ilike("countryname", countryName)
            .single();

          if (!error && data?.geojson) {
            let coords = data.geojson;
            if (coords.type === "FeatureCollection") {
              coords = coords.features[0]?.geometry.coordinates;
            } else if (coords.type === "Feature") {
              coords = coords.geometry.coordinates;
            }

            const isPoly =
              Array.isArray(coords[0][0]) && typeof coords[0][0][0] === "number";
            const geomType = isPoly ? "Polygon" : "MultiPolygon";
            const outlineGeoJSON = {
              type: "Feature",
              geometry: { type: geomType, coordinates: coords },
            };

            m.addSource("country-outline", {
              type: "geojson",
              data: outlineGeoJSON,
            });

            m.addLayer(
              {
                id: "country-outline",
                type: "line",
                source: "country-outline",
                paint: {
                  "line-color": "#f18f01",
                  "line-width": 3,
                  "line-opacity": 1,
                },
              },
              firstSymbol || undefined
            );

            if (!initialBounds) {
              const flat = isPoly ? coords.flat() : coords.flat(2);
              const lons = flat.map((c) => c[0]);
              const lats = flat.map((c) => c[1]);
              const bb = [
                [Math.min(...lons), Math.min(...lats)],
                [Math.max(...lons), Math.max(...lats)],
              ];
              if (isValidBounds(bb)) {
                m.fitBounds(bb, { padding: 20, maxZoom: 5, duration: 800 });
                m.one('moveend', () => {
                });
              }
            }
          }
        }

        // 5) Cluster + unclustered layers
        if (m.getSource("pins")) {
          const layers = [
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
              paint: { "text-color": "#fff" },
            },
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
          ];

          layers.forEach((layer) => {
            if (!m.getLayer(layer.id)) {
              m.addLayer(layer, firstSymbol || undefined);
            }
          });

          // 6) Preload ISO images
          new Set(pins.map((f) => f.properties.iso || "default")).forEach(
            (iso) => {
              const key = `marker-${iso}`;
              if (!m.hasImage(key)) {
                m.addImage(key, getMarkerImage(iso));
              }
            }
          );

          // 7) Move to top
          ["clusters", "unclustered-point"].forEach((id) => {
            if (m.getLayer(id)) {
              m.moveLayer(id);
            }
          });

          // 8) Initial data
          sourceRef.current.setData({
            type: "FeatureCollection",
            features: pins,
          });
        }

        // 9) Drag tracking
        m.on("dragstart", () => (isUserInteracting.current = true));
        m.on("dragend", () =>
          setTimeout(() => (isUserInteracting.current = false), 200)
        );
      });
    },
    [countryName, initialBounds, pins]
  );

  // ─── Update pins ────────────────────────────────
  useEffect(() => {
    const src = sourceRef.current;
    if (!src || !map) return;

    new Set(pins.map((f) => f.properties.iso || "default")).forEach((iso) => {
      const key = `marker-${iso}`;
      if (!map.hasImage(key)) {
        map.addImage(key, getMarkerImage(iso));
      }
    });

    const json = JSON.stringify(pins);
    if (json !== lastPinsJson.current) {
      lastPinsJson.current = json;
      if (pendingFrame.current) cancelAnimationFrame(pendingFrame.current);
      pendingFrame.current = requestAnimationFrame(() => {
        src.setData({ type: "FeatureCollection", features: pins });
        pendingFrame.current = null;
      });
    }
  }, [pins, map]);

  // ─── Handle external bounds update ─────────────
  useEffect(() => {
    if (!map || !isValidBounds(initialBounds) || isUserInteracting.current)
      return;
    const tid = setTimeout(() => {
      try {
        map.fitBounds(initialBounds, { padding: 20, maxZoom: 3.7, duration: 800 });
      } catch (err) {
        console.warn("fitBounds failed:", err);
      }
    }, 200);
    return () => clearTimeout(tid);
  }, [map, initialBounds]);

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
        sx={{ p: 0, position: "relative", display: "flex", flex: 1, minHeight: 0 }}
      >
        <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
          <MapContainer
            accessToken={accessToken}
            onLoad={handleLoad}
            projection="mercator"
            fullScreen={false}
            style={{ position: "absolute", inset: 0, height }}
          />
          {selectedPinId && (
            <Button
              variant="contained"
              size="small"
              sx={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
              onClick={resetPinsFilter}
            >
              Show All Pins
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

MapCard.propTypes = {
  countryName: PropTypes.string.isRequired,
  pins: PropTypes.array,
  accessToken: PropTypes.string.isRequired,
  initialBounds: PropTypes.array,
  height: PropTypes.number,
  selectedPinId: PropTypes.string,
  resetPinsFilter: PropTypes.func,
};

export default React.memo(MapCard);
