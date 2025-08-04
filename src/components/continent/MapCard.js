// src/components/continent/MapCard.js
import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  memo,
} from "react";
import PropTypes from "prop-types";
import MapContainer from "./MapContainer";
import PoiClickHandler from "components/WorldMapComponent/layers/PoiClickHandler";
import PopupComponent from "components/WorldMapComponent/PopupComponent";
import { createClusterCanvas } from "components/WorldMapComponent/marker/createClusterCanvas";
import { createMarkerCanvas } from "components/WorldMapComponent/marker/createMarkerCanvas";
import { countryColors } from "utils/countryColors";
import continentsGeoJSON from "utils/continents.json";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";

// cache for marker bitmaps
const markerCache = new Map();
function getMarkerImageData(iso) {
  if (markerCache.has(iso)) return markerCache.get(iso);
  const hex = countryColors[iso] || countryColors.default;
  const label = iso === "PEAK" ? "🏔️" : iso;
  const c = createMarkerCanvas(hex, label);
  const data = c.getContext("2d").getImageData(0, 0, c.width, c.height);
  markerCache.set(iso, data);
  return data;
}

const CLUSTER_ICON_ID = "cluster-icon";

const MapCard = forwardRef(function MapCard(
  {
    title,
    pins = [],
    accessToken,
    selectingPoint = false,
    onMapClick = () => {},
    onPoiClick = () => {},
    initialBounds = null,
    highlightContinent = null,
    height = 320,
  },
  ref
) {
  const [map, setMap] = useState(null);
  const [popup, setPopup] = useState(null);
  const isUserInteracting = useRef(false);

  // prevent auto‐moves while user drags
  useEffect(() => {
    if (!map) return;
    const start = () => (isUserInteracting.current = true);
    const end = () => setTimeout(() => (isUserInteracting.current = false), 200);
    map.on("dragstart", start);
    map.on("dragend", end);
    return () => {
      map.off("dragstart", start);
      map.off("dragend", end);
    };
  }, [map]);

  useImperativeHandle(
    ref,
    () => ({
      removePin(id) {
        if (!map) return;
        const src = map.getSource("pins");
        if (!src) return;
        const feats = src._data.features.filter((f) => f.properties.pinId !== id);
        src.setData({ type: "FeatureCollection", features: feats });
      },
      flyTo(lngLat, zoom) {
        if (!map) return;
        map.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: zoom ?? 5 });
      },
      getMap: () => map,
    }),
    [map]
  );

  const handleLoad = useCallback(
    (m) => {
      setMap(m);

      // — cluster source & layers (unchanged) —
      if (!m.getSource("pins")) {
        m.addSource("pins", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          cluster: true,
          clusterRadius: 60,
        });
      }
      if (m.hasImage(CLUSTER_ICON_ID)) m.removeImage(CLUSTER_ICON_ID);
      const cc = createClusterCanvas("#F18F01");
      m.addImage(CLUSTER_ICON_ID, cc.getContext("2d").getImageData(0, 0, cc.width, cc.height));
      const firstSymbol = m.getStyle().layers.find((l) => l.type === "symbol")?.id;

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
              "icon-size": ["step", ["get", "point_count"], 1.2, 10, 1.5, 30, 2, 70, 2.5, 200, 3],
            },
          },
          firstSymbol
        );
      }
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
            paint: { "text-color": "#fff" },
          },
          firstSymbol
        );
      }
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
          firstSymbol
        );
      }
      m.on("click", "clusters", (e) => {
        const clusterId = e.features?.[0]?.properties.cluster_id;
        if (clusterId != null) {
          m.getSource("pins").getClusterExpansionZoom(clusterId, (err, z) => {
            if (!err) m.easeTo({ center: e.lngLat, zoom: z });
          });
        }
      });

      // — NEW: continent outline w/o Russia —
      if (highlightContinent && Array.isArray(continentsGeoJSON.features)) {
        const nameLower = highlightContinent.toLowerCase();
        const base = continentsGeoJSON.features.find(
          (f) => f.properties.CONTINENT?.toLowerCase() === nameLower
        );
        if (base) {
          // for Europe, drop polygons whose avg lon > 60°E
          let geom = base.geometry;
          if (nameLower === "europe" && geom.type === "MultiPolygon") {
            geom = {
              ...geom,
              coordinates: geom.coordinates.filter((poly) => {
                const ring = poly[0];
                const avgLon =
                  ring.reduce((sum, [lon]) => sum + lon, 0) / ring.length;
                return avgLon < 60;
              }),
            };
          }
          const feature = { ...base, geometry: geom };

          if (!m.getSource("continent-outline")) {
            m.addSource("continent-outline", {
              type: "geojson",
              data: feature,
            });
            m.addLayer({
              id: "continent-outline",
              type: "line",
              source: "continent-outline",
              paint: {
                "line-color": "#f18f01",
                "line-width": 3,
              },
            });

            // bring pins above the outline
            ["clusters", "cluster-count", "unclustered-point"].forEach((layerId) => {
              if (m.getLayer(layerId)) m.moveLayer(layerId);
            });
          }
        }
      }
    },
    [highlightContinent]
  );

  // update pins
  useEffect(() => {
    if (!map) return;
    const src = map.getSource("pins");
    if (!src) return;
    const existing = map.listImages();
    const isos = [...new Set(pins.map((f) => f.properties?.iso || "default"))];
    isos.forEach((iso) => {
      const id = `marker-${iso}`;
      if (!existing.includes(id)) map.addImage(id, getMarkerImageData(iso));
    });
    src.setData({ type: "FeatureCollection", features: pins });
  }, [map, pins]);

  // selecting-point click
  useEffect(() => {
    if (!map) return;
    const cb = (e) => selectingPoint && onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    map.on("click", cb);
    return () => map.off("click", cb);
  }, [map, selectingPoint, onMapClick]);

  // popup for unclustered points
  useEffect(() => {
    if (!map) return;
    const handler = (e) => {
      const feat = e.features?.[0];
      if (!feat || !Array.isArray(feat.geometry.coordinates)) return;
      const [lng, lat] = feat.geometry.coordinates;
      const p = feat.properties || {};
      setPopup({
        title: p.title,
        description: p.description,
        imageurl: p.imageurl,
        date: p.date,
        longitude: lng,
        latitude: lat,
        countryName: p.countryName,
        id: p.pinId,
        Information: p.Information,
        been_there: p.been_there,
        want_to_go: p.want_to_go,
        saved_count: p.saved_count,
      });
    };
    map.on("click", "unclustered-point", handler);
    const canvas = map.getCanvas();
    if (canvas?.style) canvas.style.cursor = "pointer";
    return () => {
      map.off("click", "unclustered-point", handler);
      if (canvas?.style) canvas.style.cursor = "";
    };
  }, [map]);

  // fit to initialBounds
  useEffect(() => {
    if (map && initialBounds && !isUserInteracting.current) {
      map.fitBounds(initialBounds, { padding: 20, maxZoom: 4, duration: 800 });
    }
  }, [map, initialBounds]);

  // close popup on move/zoom
  useEffect(() => {
    if (!map) return;
    const close = () => setPopup(null);
    map.on("movestart", close);
    map.on("zoomstart", close);
    return () => {
      map.off("movestart", close);
      map.off("zoomstart", close);
    };
  }, [map]);

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
          {popup && <PopupComponent data={popup} onClose={() => setPopup(null)} />}
        </Box>
      </CardContent>
    </Card>
  );
});

MapCard.propTypes = {
  title: PropTypes.string,
  pins: PropTypes.array,
  accessToken: PropTypes.string.isRequired,
  selectingPoint: PropTypes.bool,
  onMapClick: PropTypes.func,
  onPoiClick: PropTypes.func,
  initialBounds: PropTypes.array,
  highlightContinent: PropTypes.string,
  height: PropTypes.number,
};

export default memo(MapCard);
