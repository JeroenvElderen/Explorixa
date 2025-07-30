import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapContainer({
  accessToken,
  onLoad,
  projection = 'globe',
  // switch to Mapbox default streets-v11 for testing
  styleUrl = "mapbox://styles/jeroenvanelderen/cmc958dgm006s01shdiu103uz",
}) {
  const mapNode = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: styleUrl,
      center: [0, 20],
      zoom: 1.5,
      projection,
      attributionControl: false,
    });

    map.on('load', () => {
      if (projection === 'globe' && map.setFog) {
        map.setFog({ color: 'rgb(17,17,17)', 'high-color': 'rgb(17,17,17)', 'horizon-blend': 0.2, 'space-color': 'rgb(0,0,0)', 'star-intensity': 0.5 });
      } else if (map.setFog) {
        map.setFog(null);
      }
      onLoad(map);
    });

    return () => map.remove();
  }, [accessToken, onLoad, projection, styleUrl]);

  return (
    <div
      ref={mapNode}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    />
  );
}
