// MapCard.js
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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";

// in-module cache for marker canvases
const markerCache = new Map();
function getMarkerImageData(iso) {
  if (markerCache.has(iso)) return markerCache.get(iso);
  const hex = countryColors[iso] || countryColors.default;
  const label = iso === "PEAK" ? "🏔️" : iso;
  const canvas = createMarkerCanvas(hex, label);
  const imgData = canvas
    .getContext("2d")
    .getImageData(0, 0, canvas.width, canvas.height);
  markerCache.set(iso, imgData);
  return imgData;
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
    initialTarget = null,
    flyOnTarget = false,
    height = 320,
  },
  ref
) {
  const [map, setMap] = useState(null);
  const [popup, setPopup] = useState(null);
  const isUserInteracting = useRef(false);

  useEffect(() => {
    if (!map) return;
    const onDragStart = () => {
      isUserInteracting.current = true;
    };
    const onDragEnd = () => {
      setTimeout(() => {
        isUserInteracting.current = false;
      }, 200);
    };
    map.on("dragstart", onDragStart);
    map.on("dragend", onDragEnd);
    return () => {
      map.off("dragstart", onDragStart);
      map.off("dragend", onDragEnd);
    };
  }, [map]);

  useImperativeHandle(
    ref,
    () => ({
      removePin(id) {
        if (!map) return;
        const src = map.getSource("pins");
        if (!src) return;
        const current = src._data?.features || [];
        const filtered = current.filter((f) => f.properties.pinId !== id);
        map.getSource("pins")?.setData({
          type: "FeatureCollection",
          features: filtered,
        });
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
      const cd = cc.getContext("2d").getImageData(0, 0, cc.width, cc.height);
      m.addImage(CLUSTER_ICON_ID, cd);

      const firstSymbolId = m
        .getStyle()
        .layers.find((l) => l.type === "symbol")?.id;

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
          firstSymbolId
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
          firstSymbolId
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
          firstSymbolId
        );
      }

      m.on("click", "clusters", (e) => {
        if (!e.features || !e.features[0]) return;
        const clusterId = e.features[0].properties.cluster_id;
        m.getSource("pins")?.getClusterExpansionZoom(clusterId, (err, z) => {
          if (!err) m.easeTo({ center: e.lngLat, zoom: z });
        });
      });
    },
    []
  );

  useEffect(() => {
    if (!map) return;
    const src = map.getSource("pins");
    if (!src) return;

    const existing = map.listImages();
    const isos = Array.from(
      new Set(pins.map((f) => f.properties?.iso || "default"))
    );
    isos.forEach((iso) => {
      const imgId = `marker-${iso}`;
      if (!existing.includes(imgId)) {
        map.addImage(imgId, getMarkerImageData(iso));
      }
    });

    map.getSource("pins")?.setData({
      type: "FeatureCollection",
      features: pins,
    });
  }, [map, pins]);

  useEffect(() => {
    if (!map) return;
    const cb = (e) => {
      if (!selectingPoint) return;
      onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    map.on("click", cb);
    return () => map.off("click", cb);
  }, [map, selectingPoint, onMapClick]);

  useEffect(() => {
    if (!map) return;
    const handler = (e) => {
      if (!e.features || !e.features[0]) return;
      const feat = e.features[0];
      if (!feat.geometry || !Array.isArray(feat.geometry.coordinates)) return;
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
    const canvas = map.getCanvas?.();
    if (canvas?.style) canvas.style.cursor = "pointer";
    return () => {
      map.off("click", "unclustered-point", handler);
      if (canvas?.style) canvas.style.cursor = "";
    };
  }, [map]);

  useEffect(() => {
    if (
      map &&
      flyOnTarget &&
      initialTarget?.lng != null &&
      initialTarget?.lat != null &&
      !isUserInteracting.current
    ) {
      map.flyTo({
        center: [initialTarget.lng, initialTarget.lat],
        zoom: Math.max(map.getZoom(), 4),
      });
    }
  }, [map, flyOnTarget, initialTarget]);

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
      height: height,
    }}
  >
    <CardContent
      sx={{
        p: 0,
        position: "relative",
        display: "flex",
        flex: 1,
        minHeight: 0, // critical for flex children not to overflow
      }}
    >
      <Box
        sx={{
          flex: 1, // fill the card vertically
          position: "relative",
          minHeight: 0,
        }}
      >
        <MapContainer
          accessToken={accessToken}
          onLoad={handleLoad}
          projection="mercator"
          fullScreen={false}
          style={{ position: "absolute", inset: 0, height: height, }}
        />
        {map && (
          <PoiClickHandler
            map={map}
            accessToken={accessToken}
            onPoiClick={onPoiClick}
          />
        )}
        {popup && (
          <PopupComponent data={popup} onClose={() => setPopup(null)} />
        )}
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
  initialTarget: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  flyOnTarget: PropTypes.bool,
  height: PropTypes.number,
};

export default memo(MapCard);
