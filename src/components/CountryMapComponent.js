import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const CountryMapComponent = ({ isoCode, accessToken }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!isoCode) return;

    mapboxgl.accessToken = accessToken || 'pk.eyJ1IjoiamVyb2VudmFuZWxkZXJlbiIsImEiOiJjbWMwa2M0cWswMm9jMnFzNjI3Z2I4YnV4In0.qUqeNUDYMBf3E54ouOd2Jg';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 20],
      zoom: 2,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add country boundaries source
      if (!map.getSource('country-boundaries')) {
        map.addSource('country-boundaries', {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
        });
      }

      // Add country border layer with filter by ISO code
      if (!map.getLayer('country-border')) {
        map.addLayer({
          id: 'country-border',
          type: 'line',
          source: 'country-boundaries',
          'source-layer': 'country_boundaries',
          paint: {
            'line-color': '#007cbf',
            'line-width': 3,
          },
          filter: ['==', ['get', 'iso_3166_1_alpha_3'], isoCode],
        });
      }

      // Fit map to country bounds
      const features = map.querySourceFeatures('country-boundaries', {
        sourceLayer: 'country_boundaries',
      });
      const countryFeature = features.find(f => f.properties.iso_3166_1_alpha_3 === isoCode);

      if (countryFeature) {
        const coords = [];
        if (countryFeature.geometry.type === 'Polygon') {
          countryFeature.geometry.coordinates.forEach(ring =>
            ring.forEach(coord => coords.push(coord))
          );
        } else if (countryFeature.geometry.type === 'MultiPolygon') {
          countryFeature.geometry.coordinates.forEach(polygon =>
            polygon.forEach(ring =>
              ring.forEach(coord => coords.push(coord))
            )
          );
        }
        const lons = coords.map(c => c[0]);
        const lats = coords.map(c => c[1]);
        const bbox = [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ];
        map.fitBounds(bbox, { padding: 40, maxZoom: 6 });
      }
    });

    return () => {
      map.remove();
    };
  }, [isoCode, accessToken]);

  return <div ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />;
};

export default CountryMapComponent;
