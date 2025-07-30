// MapInitializer.js
import mapboxgl from "mapbox-gl";

export function initializeMap(containerId, accessToken) {
  mapboxgl.accessToken = accessToken;

  return new mapboxgl.Map({
    container: containerId,
    style: "mapbox://styles/jeroenvanelderen/cmc958dgm006s01shdiu103uz",
    center: [0, 20],
    zoom: 1.5,
    projection: "globe",
    attributionControl: false,
  });
}
