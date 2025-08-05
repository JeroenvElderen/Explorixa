// -------------------------------------------
// src/components/WorldMapComponent/MapCard.jsx
import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import MapContainer from "./MapContainer";
import PoiClickHandler from "components/WorldMapComponent/layers/PoiClickHandler";
import { getClusterIcon, getMarkerImage, getContinentOutline } from "./marker/markerManager";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import { Button } from "@mui/material";

const CLUSTER_ICON_ID = "cluster-icon";

// Pre-memoized layer definitions
const clusterLayer = {
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
};

const clusterCountLayer = {
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
};

const unclusteredLayer = {
  id: "unclustered-point",
  type: "symbol",
  source: "pins",
  filter: ["!", ["has", "point_count"]],
  layout: {
    "icon-image": ["concat", "marker-", ["get", "iso"]],
    "icon-allow-overlap": true,
    "icon-anchor": "bottom",
  },
};

const MapCard = forwardRef(function MapCard(
  {
    pins = [],
    accessToken,
    selectingPoint = false,
    onMapClick = () => {},
    onPoiClick = () => {},
    initialBounds = null,
    highlightContinent = null,
    height = 320,
    selectedPinId = null,
    resetPinsFilter = () => {},
  },
  ref
) {
  const [map, setMap] = useState(null);
  const isUserInteracting = useRef(false);
  const lastPinsJson = useRef("");
  const pendingFrame = useRef(null);

  // Expose methods
  useImperativeHandle(
    ref,
    () => ({
      removePin(id) {
        const src = map?.getSource("pins");
        if (src) {
          const feats = src._data.features.filter(f => f.properties.pinId !== id);
          src.setData({ type: "FeatureCollection", features: feats });
        }
      },
      flyTo(lngLat, zoom = 5) {
        map?.flyTo({ center: [lngLat.lng, lngLat.lat], zoom });
      },
      getMap: () => map,
    }),
    [map]
  );

  // Map load handler
  const handleLoad = useCallback(
    m => {
      m.once("load", () => {
        setMap(m);

        if (!m.getSource("pins")) {
          m.addSource("pins", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
            cluster: true,
            clusterRadius: 60,
          });
        }

        if (m.hasImage(CLUSTER_ICON_ID)) m.removeImage(CLUSTER_ICON_ID);
        m.addImage(CLUSTER_ICON_ID, getClusterIcon());

        const firstSymbol = m.getStyle().layers.find(l => l.type === "symbol")?.id;
        [clusterLayer, clusterCountLayer, unclusteredLayer].forEach(layer => {
          if (!m.getLayer(layer.id)) m.addLayer(layer, firstSymbol);
        });

        // Highlight continent
        if (highlightContinent) {
          const feat = getContinentOutline(highlightContinent);
          if (feat && !m.getSource("country-outline")) {
            m.addSource("country-outline", { type: "geojson", data: feat });
            m.addLayer({ id: "country-outline", type: "line", source: "country-outline", paint: { "line-color": "#f18f01", "line-width": 3 } });
            if (!initialBounds) {
              const coords = feat.geometry.type === "Polygon"
                ? feat.geometry.coordinates.flat()
                : feat.geometry.coordinates.flat(2);
              const lngs = coords.map(c => c[0]);
              const lats = coords.map(c => c[1]);
              m.fitBounds([ [Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)] ], { padding: 20, maxZoom: 5, duration: 800 });
            }
          }
        }

        // Interaction flags
        const onDragStart = () => (isUserInteracting.current = true);
        const onDragEnd = () => setTimeout(() => (isUserInteracting.current = false), 200);
        m.on("dragstart", onDragStart);
        m.on("dragend", onDragEnd);
      });
    },
    [highlightContinent, initialBounds]
  );

  // Batched setData
  useEffect(() => {
    if (!map) return;
    const src = map.getSource("pins"); if (!src) return;
    const json = JSON.stringify(pins);
    if (json === lastPinsJson.current) return;
    lastPinsJson.current = json;
    if (pendingFrame.current) cancelAnimationFrame(pendingFrame.current);
    pendingFrame.current = requestAnimationFrame(() => {
      src.setData({ type: "FeatureCollection", features: pins });
      pendingFrame.current = null;
    });
  }, [map, pins]);

  // Map click for selecting point
  useEffect(() => {
    if (!map || !selectingPoint) return;
    const cb = e => onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    map.on("click", cb);
    return () => map.off("click", cb);
  }, [map, selectingPoint, onMapClick]);

  // Pin click handler
  const onUnclusteredClick = useCallback(
    e => {
      const feat = e.features?.[0];
      if (feat?.properties.pinId) onPoiClick(feat.properties.pinId);
    },
    [onPoiClick]
  );
  useEffect(() => {
    if (!map) return;
    map.on("click", "unclustered-point", onUnclusteredClick);
    map.getCanvas().style.cursor = "pointer";
    return () => {
      map.off("click", "unclustered-point", onUnclusteredClick);
      map.getCanvas().style.cursor = "";
    };
  }, [map, onUnclusteredClick]);

  // Debounced fitBounds
  useEffect(() => {
    if (!map || !initialBounds || isUserInteracting.current) return;
    const tid = setTimeout(() => {
      map.fitBounds(initialBounds, { padding: 20, maxZoom: 4, duration: 800 });
    }, 200);
    return () => clearTimeout(tid);
  }, [map, initialBounds]);

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden", display: "flex", flexDirection: "column", height }}>
      <CardContent sx={{ p: 0, position: "relative", display: "flex", flex: 1, minHeight: 0 }}>
        <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
          <MapContainer
            accessToken={accessToken}
            onLoad={handleLoad}
            projection="mercator"
            fullScreen={false}
            style={{ position: "absolute", inset: 0, height }}
          />
          {map && <PoiClickHandler map={map} accessToken={accessToken} onPoiClick={onPoiClick} />}
          {selectedPinId && (
            <Button variant="contained" size="small" sx={{ position: "absolute", top: 16, left: 16, zIndex: 10 }} onClick={resetPinsFilter}>
              Show All Pins
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});
MapCard.propTypes = {
  pins: PropTypes.array,
  accessToken: PropTypes.string.isRequired,
  selectingPoint: PropTypes.bool,
  onMapClick: PropTypes.func,
  onPoiClick: PropTypes.func,
  initialBounds: PropTypes.array,
  highlightContinent: PropTypes.string,
  height: PropTypes.number,
  selectedPinId: PropTypes.string,
  resetPinsFilter: PropTypes.func,
};
export default React.memo(MapCard);
