// src/components/WorldMapComponent/WorldMapComponent.jsx

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

const WorldMapComponent = forwardRef(({
  accessToken,
  selectingPoint = false,
  onMapClick = () => {},
  onPoiClick = () => {},
}, ref) => {
  const features = usePins();      // your hook for fetching pins
  const [map, setMap] = useState(null);
  const [popupData, setPopupData] = useState(null);

  // Expose removePinFromMap to parent
  useImperativeHandle(ref, () => ({
    removePinFromMap: pinId => {
      const src = map?.getSource("pins");
      if (!src?._data) return;
      const kept = src._data.features.filter(f => f.properties.pinId !== pinId);
      src.setData({ ...src._data, features: kept });
    },
  }), [map]);

  // 1) On map load: create source, register cluster icon, AND add both layers
  const handleLoad = useCallback(m => {
    setMap(m);

    // a) create the source (empty for now)
    m.addSource("pins", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
      cluster: true,
      clusterRadius: 60,
    });

    // b) register cluster icon
    const clusterId = "cluster-icon";
    if (m.hasImage(clusterId)) m.removeImage(clusterId);
    const cCanvas = createClusterCanvas("#F18F01");
    const clusterData = cCanvas
      .getContext("2d")
      .getImageData(0, 0, cCanvas.width, cCanvas.height);
    m.addImage(clusterId, clusterData);

    // c) add the cluster layers
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
        "text-font": ["DIN Offc Pro Medium","Arial Unicode MS Bold"],
        "text-size": 12,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: { "text-color": "#fff" },
    });

    // d) add the unclustered-point layer now (icons resolve later)
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

  // 2) Sync effect: whenever map OR features change, register new marker-<ISO> images and update data
  useEffect(() => {
    if (!map?.getSource) return;
    const src = map.getSource("pins");
    if (!src) return;

    console.log("[worldmap] syncing", features.length, "features");

    // register any new marker icons
    const existing = map.listImages();
    const isos = [...new Set(features.map(f => f.properties.iso))];
    isos.forEach(iso => {
      const imgId = `marker-${iso}`;
      if (existing.includes(imgId)) return;
      const hex = countryColors[iso] || countryColors.default;
      const label = iso === "PEAK" ? "🏔️" : iso;
      const canvas = createMarkerCanvas(hex, label);
      const imgData = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height);
      map.addImage(imgId, imgData);
      console.log(`[worldmap] registered icon ${imgId}`);
    });

    // finally, update the geojson data
    src.setData({ type: "FeatureCollection", features });
  }, [map, features]);

  // 3) click→select handler
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

  // 4) click an unclustered marker to open PopupComponent
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
