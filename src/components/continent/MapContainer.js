// MapContainer.js
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import PropTypes from 'prop-types';

export default function MapContainer({
  accessToken,
  onLoad,
  projection = 'globe',
  styleUrl = 'mapbox://styles/jeroenvanelderen/cmc958dgm006s01shdiu103uz',
  fullScreen = true,
  style = {},
}) {
  const mapNode = useRef(null);
  const mapInstanceRef = useRef(null);

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
    mapInstanceRef.current = map;

    map.on('load', () => {
      if (projection === 'globe' && map.setFog) {
        map.setFog({
          color: 'rgb(17,17,17)',
          'high-color': 'rgb(17,17,17)',
          'horizon-blend': 0.2,
          'space-color': 'rgb(0,0,0)',
          'star-intensity': 0.5,
        });
      } else if (map.setFog) {
        map.setFog(null);
      }
      onLoad(map);
    });

    return () => {
      map.remove();
    };
  }, [accessToken, onLoad, projection, styleUrl]);

  // always fill its containing box explicitly when not fullscreen
  const baseStyle = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }
    : {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      };

  return <div ref={mapNode} style={{ ...baseStyle, ...style }} />;
}

MapContainer.propTypes = {
  accessToken: PropTypes.string.isRequired,
  onLoad: PropTypes.func.isRequired,
  projection: PropTypes.string,
  styleUrl: PropTypes.string,
  fullScreen: PropTypes.bool,
  style: PropTypes.object,
};
