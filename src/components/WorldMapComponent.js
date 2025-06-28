import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import Supercluster from "supercluster";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "../SupabaseClient";
import PopupComponent from "./PopupComponent";
import "./WorldMapComponent.css";

const WorldMapComponent = ({
  accessToken,
  selectingPoint = false,
  onMapClick = () => {},
  onPoiClick = () => {},
  target,
  flyOnTarget = false,
}) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const superclusterRef = useRef(null);
  const selectedPoiMarkerRef = useRef(null);  // ← ref for highlighting selected POI
  const [popupData, setPopupData] = useState(null);

  const countryColors = {
    Sweden: "#FCD116",
    Afghanistan: "#007A36",
    default: "#AAAAAA",
  };
  const getCountryColor = (country) =>
    countryColors[country] || countryColors.default;

  mapboxgl.accessToken = accessToken;

  // 1) Initialize map, clusters, and POI/peak listeners
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: "world-map",
      style: "mapbox://styles/jeroenvanelderen/cmc958dgm006s01shdiu103uz",
      center: [0, 20],
      zoom: 1.5,
      projection: "globe",
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", async () => {
      // Atmosphere
      map.setFog({
        color: "rgb(17,17,17)",
        "high-color": "rgb(17,17,17)",
        "horizon-blend": 0.2,
        "space-color": "rgb(0,0,0)",
        "star-intensity": 0.5,
      });

      // Country boundaries
      map.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });
      map.addLayer({
        id: "country-fill",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        paint: { "fill-color": "#627BC1", "fill-opacity": 0 },
      });
      map.addLayer({
        id: "country-border",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        paint: { "line-color": "#ffffff", "line-width": 1.5 },
      });

      // Load pins and clusters
      await loadPinsAndCluster(map);
      map.on("moveend", () => updateMarkers(map));

      // click listener for POIs AND natural features
      const handlePoiClick = async (e) => {
        if (!e.features?.length) return;
        const feat = e.features[0];
        const { lng, lat } = e.lngLat;

        // Remove previous highlighted POI marker
        if (selectedPoiMarkerRef.current) {
          selectedPoiMarkerRef.current.remove();
        }
        // Add a grey marker for the selected POI
        selectedPoiMarkerRef.current = new mapboxgl.Marker({ color: "#888888" })
          .setLngLat([lng, lat])
          .addTo(map);

        // Reverse geocode POI + context
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&types=poi,place,region,country,address&limit=1`
        );
        const { features } = await res.json();
        const primary = features[0] || {};

        let city =
          primary.context?.find((c) => c.id.startsWith("place"))?.text || "";
        if (!city) {
          const cityRes = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&types=place&limit=1`
          );
          const cityJson = await cityRes.json();
          city = cityJson.features[0]?.text || "";
        }
        const country =
          primary.context?.find((c) => c.id.startsWith("country"))?.text || "";

        onPoiClick({
          lat,
          lng,
          text: feat.text,
          name: feat.properties.name,
          landmark: feat.properties.name || feat.text || "Unnamed POI",
          city,
          country,
        });
      };

      const interactiveLayers = ["poi-label", "natural-point-label"];
      interactiveLayers.forEach((layerId) => {
        const attach = () => {
          map.on("click", layerId, handlePoiClick);
          map.on("mouseenter", layerId, () =>
            (map.getCanvas().style.cursor = "pointer")
          );
          map.on("mouseleave", layerId, () =>
            (map.getCanvas().style.cursor = "")
          );
        };
        if (map.getLayer(layerId)) {
          attach();
        } else {
          map.on("styledata", () => {
            if (map.getLayer(layerId)) attach();
          });
        }
      });
    });

    return () => {
      if (selectedPoiMarkerRef.current) {
        selectedPoiMarkerRef.current.remove();
      }
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  // 2) Fly the map to any new `target` [lng, lat], but only if flyOnTarget is true
  useEffect(() => {
    const map = mapRef.current;
    if (map && flyOnTarget && Array.isArray(target)) {
      map.flyTo({
        center: target,
        zoom: 12,
        speed: 1.2,
        curve: 1.4,
      });
    }
  }, [target, flyOnTarget]);

  // 3) Raw map click for manual pin placement
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e) => {
      if (!selectingPoint) return;
      onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    };
    map.on("click", handler);
    return () => map.off("click", handler);
  }, [selectingPoint, onMapClick]);

  const loadPinsAndCluster = async (map) => {
    const { data: pins, error } = await supabase.from("pins").select("*");
    if (error) return console.error("Error loading pins:", error);

    const features = pins.map((pin) => ({
      type: "Feature",
      properties: {
        cluster: false,
        pinId: pin.id,
        title: pin.Name || "No title",
        description: pin.Information || "No description",
        imageurl: pin["Main Image"] || "",
        date: pin.created_at,
        countryName: pin.countryName || "default",
      },
      geometry: {
        type: "Point",
        coordinates: [pin.longitude, pin.latitude],
      },
    }));

    superclusterRef.current = new Supercluster({ radius: 60, maxZoom: 16 });
    superclusterRef.current.load(features);
    updateMarkers(map);
  };

  const clearMarkers = () => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  };

  const updateMarkers = (map) => {
    if (!superclusterRef.current) return;
    clearMarkers();
    const bounds = map.getBounds().toArray().flat();
    const zoom = Math.floor(map.getZoom());
    const clusters = superclusterRef.current.getClusters(bounds, zoom);

    clusters.forEach((cluster) => {
      const [lng, lat] = cluster.geometry.coordinates;

      if (cluster.properties.cluster) {
        const leaves = superclusterRef.current.getLeaves(
          cluster.properties.cluster_id,
          1
        );
        const color = getCountryColor(leaves[0]?.properties.countryName);
        const el = document.createElement("div");
        el.className = "cluster-marker";
        el.style.cssText = `
          background: ${color};
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: bold;
          cursor: pointer;
        `;
        el.innerText = cluster.properties.point_count.toString();
        el.addEventListener("click", () => {
          const expZoom = superclusterRef.current.getClusterExpansionZoom(
            cluster.properties.cluster_id
          );
          map.easeTo({ center: [lng, lat], zoom: Math.min(expZoom, 20) });
        });
        markersRef.current.push(
          new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)
        );
      } else {
        const color = getCountryColor(cluster.properties.countryName);
        const marker = new mapboxgl.Marker({ color })
          .setLngLat([lng, lat])
          .addTo(map);
        marker.getElement().style.cursor = "pointer";
        marker.getElement().addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          setPopupData({
            title: cluster.properties.title,
            description: cluster.properties.description,
            imageurl: cluster.properties.imageurl,
            date: cluster.properties.date,
            longitude: lng,
            latitude: lat,
            countryName: cluster.properties.countryName,
          });
        });
        markersRef.current.push(marker);
      }
    });
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        id="world-map"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      />
      {popupData && (
        <PopupComponent data={popupData} onClose={() => setPopupData(null)} />
      )}
    </div>
  );
};

export default WorldMapComponent;
