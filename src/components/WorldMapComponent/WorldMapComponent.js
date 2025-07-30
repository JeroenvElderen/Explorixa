// src/components/WorldMapComponent/WorldMapComponent.jsx
import React, {
  forwardRef,
  memo,
  useState,
  useImperativeHandle,
  useCallback,
  useEffect,
} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapContainer from "./MapContainer";
import usePins from "../../hooks/usePins";
import { createClusterCanvas } from "./marker/createClusterCanvas";
import { createMarkerCanvas } from "./marker/createMarkerCanvas";
import PoiClickHandler from "./layers/PoiClickHandler";
import PopupComponent from "./PopupComponent";
import { countryColors } from "./constants";

// in‑module cache for marker canvases
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

const WorldMapComponent = forwardRef(function WorldMapComponent(
  { accessToken, selectingPoint, onMapClick, onPoiClick, target, flyOnTarget },
  ref
) {
  const features = usePins();
  const [map, setMap] = useState(null);
  const [popup, setPopup] = useState(null);

  // expose removePinFromMap
  useImperativeHandle(
    ref,
    () => ({
      removePinFromMap(id) {
        const src = map?.getSource("pins");
        if (!src?._data) return;
        const remaining = src._data.features.filter(
          f => f.properties.pinId !== id
        );
        src.setData({ ...src._data, features: remaining });
      },
    }),
    [map]
  );

  // initial map load
  const handleLoad = useCallback(
    m => {
      mapboxgl.accessToken = accessToken;
      setMap(m);

      // 1) add empty source
      m.addSource("pins", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterRadius: 60,
      });

      // 2) cluster icon
      const cid = "cluster-icon";
      if (m.hasImage(cid)) m.removeImage(cid);
      const cc = createClusterCanvas("#F18F01");
      const cd = cc.getContext("2d").getImageData(0, 0, cc.width, cc.height);
      m.addImage(cid, cd);

      // 3) cluster layers
      m.addLayer({
        id: "clusters",
        type: "symbol",
        source: "pins",
        filter: ["has", "point_count"],
        layout: {
          "icon-image": cid,
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
      m.addLayer({
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

      // 4) unclustered points
      m.addLayer({
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
    },
    [accessToken]
  );

  // whenever features or map change → register images & update data
  useEffect(() => {
    if (!map) return;
    const src = map.getSource("pins");
    if (!src) return;

    // register any missing marker-<iso> images
    const existing = map.listImages();
    const isos = [...new Set(features.map(f => f.properties.iso))];
    isos.forEach(iso => {
      const imgId = `marker-${iso}`;
      if (!existing.includes(imgId)) {
        map.addImage(imgId, getMarkerImageData(iso));
      }
    });

    // update geojson
    src.setData({ type: "FeatureCollection", features });
  }, [map, features]);

  // map‐click for selecting a raw lat/lng
  useEffect(() => {
    if (!map) return;
    const cb = e => {
      if (selectingPoint) {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    };
    map.on("click", cb);
    return () => map.off("click", cb);
  }, [map, selectingPoint, onMapClick]);

  // click unclustered → popup
  useEffect(() => {
    if (!map) return;
    const handler = e => {
      const feat = e.features[0];
      const [lng, lat] = feat.geometry.coordinates;
      const p = feat.properties;
      setPopup({
        title: p.title,
        description: p.description,
        imageurl: p.imageurl,
        date: p.date,
        longitude: lng,
        latitude: lat,
        countryName: p.countryName,
      });
    };
    map.on("click", "unclustered-point", handler);
    map.getCanvas().style.cursor = "pointer";
    return () => {
      map.off("click", "unclustered-point", handler);
      map.getCanvas().style.cursor = "";
    };
  }, [map]);

  return (
    <>
      <MapContainer accessToken={accessToken} onLoad={handleLoad} />

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
    </>
  );
});

// memoize so parent re‑renders don’t rebuild internal state
export default memo(WorldMapComponent);
