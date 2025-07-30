import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useCallback,
  useEffect,
} from "react";
import MapContainer from "./MapContainer";
import usePins from "./usePins";
import { createClusterCanvas } from "./marker/createClusterCanvas";
import { createMarkerCanvas } from "./marker/createMarkerCanvas";
import PoiClickHandler from "./layers/PoiClickHandler";
import PopupComponent from "./PopupComponent";
import { countryColors } from "./constants";
import "./WorldMapComponent.css";

// ── Memoization cache for marker canvases ────────────────────────────────────
const markerImageCache = new Map();
function getMarkerImageData(iso) {
  if (markerImageCache.has(iso)) {
    return markerImageCache.get(iso);
  }
  const hex = countryColors[iso] || countryColors.default;
  const label = iso === "PEAK" ? "🏔️" : iso;
  const canvas = createMarkerCanvas(hex, label);
  const imgData = canvas.getContext("2d")
    .getImageData(0, 0, canvas.width, canvas.height);
  markerImageCache.set(iso, imgData);
  return imgData;
}

const WorldMapComponent = forwardRef(({
  accessToken,
  selectingPoint = false,
  onMapClick = () => {},
  onPoiClick = () => {},
}, ref) => {
  const features = usePins();      // hook to fetch & poll pins
  const [map, setMap] = useState(null);
  const [popupData, setPopupData] = useState(null);

  // Expose removePinFromMap
  useImperativeHandle(ref, () => ({
    removePinFromMap: pinId => {
      const src = map?.getSource("pins");
      if (!src?._data) return;
      const kept = src._data.features.filter(f => f.properties.pinId !== pinId);
      src.setData({ ...src._data, features: kept });
    },
  }), [map]);

  // 1) On map load: create source, cluster+unclustered layers & cluster icon
  const handleLoad = useCallback(m => {
    setMap(m);

    // a) GeoJSON source
    m.addSource("pins", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
      cluster: true,
      clusterRadius: 60,
    });

    // b) cluster icon
    const clusterId = "cluster-icon";
    if (m.hasImage(clusterId)) m.removeImage(clusterId);
    const cCanvas = createClusterCanvas("#F18F01");
    const clusterData = cCanvas.getContext("2d")
      .getImageData(0, 0, cCanvas.width, cCanvas.height);
    m.addImage(clusterId, clusterData);

    // c) cluster layers
    m.addLayer({
      id: "clusters",
      type: "symbol",
      source: "pins",
      filter: ["has", "point_count"],
      layout: {
        "icon-image": clusterId,
        "icon-allow-overlap": true,
        "icon-anchor": "center",
        "icon-size": [
          "step", ["get", "point_count"],
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
        "text-font": ["DIN Offc Pro Medium","Arial Unicode MS Bold"],
        "text-size": 12,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: { "text-color": "#fff" },
    });

    // d) unclustered layer (icons resolve later via `marker-<iso>`)
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

    console.log("[worldmap] map loaded: source+layers created");
  }, []);

  // 2) Sync effect: register new marker images once + update data
  useEffect(() => {
    if (!map?.getSource) return;
    const src = map.getSource("pins");
    if (!src) return;

    console.log("[worldmap] syncing", features.length, "features");

    // register any new marker-<ISO> image
    const existing = map.listImages();
    const isos = [...new Set(features.map(f => f.properties.iso))];
    isos.forEach(iso => {
      const imgId = `marker-${iso}`;
      if (!existing.includes(imgId)) {
        map.addImage(imgId, getMarkerImageData(iso));
        console.log(`[worldmap] registered icon ${imgId}`);
      }
    });

    // finally update source data
    src.setData({ type: "FeatureCollection", features });
  }, [map, features]);

  // 3) click→selectPoint mode
  useEffect(() => {
    if (!map?.on) return;
    const cb = e => {
      if (selectingPoint) {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    };
    map.on("click", cb);
    return () => map.off("click", cb);
  }, [map, selectingPoint, onMapClick]);

  // 4) click an unclustered point → open PopupComponent
  useEffect(() => {
    if (!map?.on || !map.getLayer("unclustered-point")) return;
    const onMarkerClick = e => {
      const feat = e.features[0];
      const [lng, lat] = feat.geometry.coordinates;
      const p = feat.properties;
      setPopupData({
        title: p.title,
        description: p.description,
        imageurl: p.imageurl,
        date: p.date,
        longitude: lng,
        latitude: lat,
        countryName: p.countryName,
      });
    };
    map.on("click", "unclustered-point", onMarkerClick);
    map.getCanvas().style.cursor = "pointer";
    return () => {
      map.off("click", "unclustered-point", onMarkerClick);
      map.getCanvas().style.cursor = "";
    };
  }, [map]);

  // 5) click a cluster → zoom in
  useEffect(() => {
    if (!map?.on || !map.getLayer("clusters")) return;
    const onClusterClick = e => {
      const clusterId = e.features[0].properties.cluster_id;
      const src = map.getSource("pins");
      if (!src.getClusterExpansionZoom) return;
      src.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (!err) map.easeTo({ center: e.lngLat, zoom });
      });
    };
    map.on("click", "clusters", onClusterClick);
    return () => map.off("click", "clusters", onClusterClick);
  }, [map]);

  return (
    <>
      <MapContainer accessToken={accessToken} onLoad={handleLoad} />

      {map && (
        <PoiClickHandler
          map={map}
          accessToken={accessToken}
          onPoiClick={data => setPopupData(data)}
        />
      )}

      {popupData && (
        <PopupComponent
          data={popupData}
          onClose={() => setPopupData(null)}
        />
      )}
    </>
  );
});

export default WorldMapComponent;
