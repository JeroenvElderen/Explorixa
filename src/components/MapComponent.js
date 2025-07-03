import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../SupabaseClient';
import * as turf from '@turf/turf';
import countriesGeoJSON from '../data/countries.json';
import PopupComponent from './PopupComponent';
import '../MapComponent.css'; // <-- Import CSS here

const MapComponent = ({ searchLocation, accessToken }) => {
  const mapRef = useRef(null);
  const pinsMarkersRef = useRef([]);
  const searchMarkerRef = useRef(null);
  const [popupData, setPopupData] = useState(null);
  const [countryBBox, setCountryBBox] = useState(null);
  const [currentCountry, setCurrentCountry] = useState(null);

  useEffect(() => {
    mapboxgl.accessToken =
      accessToken ||
      process.env.REACT_APP_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-streets-v11',
      attributionControl: false,
      center: [0, 0],
      zoom: 2,
    });

    mapRef.current = map;

    map.on('load', () => {
      map.addLayer({
        id: 'country-borders',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
        },
        'source-layer': 'country_boundaries',
        paint: {
          'line-color': '#FF0000',
          'line-width': 0.5,
        },
      });

      map.addLayer({
        id: 'countries-layer',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
        },
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': '#888',
          'fill-opacity': 0.1,
        },
      });

      map.addLayer({
        id: 'highlighted-country-fill',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
        },
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 0.2,
        },
        filter: ['==', ['get', 'iso_3166_1_alpha_3'], ''],
      });

      map.addLayer({
        id: 'highlighted-country-border',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
        },
        'source-layer': 'country_boundaries',
        paint: {
          'line-color': '#E0F2FE',
          'line-width': 2.0,
        },
        filter: ['==', ['get', 'iso_3166_1_alpha_3'], ''],
      });

      map.on('click', 'countries-layer', async (e) => {
        if (!e.features.length) return;
        const clickedFeature = e.features[0];
        const iso_a3 = clickedFeature.properties.iso_3166_1_alpha_3?.trim()?.toUpperCase();
        const countryName = clickedFeature.properties.name_en;

        if (!iso_a3 || !countryName) return;
        setCurrentCountry(countryName.trim());

        let fullCountryFeature = countriesGeoJSON.features.find(
          (feature) => feature.properties?.ISO_A3?.trim()?.toUpperCase() === iso_a3
        );

        if (!fullCountryFeature) {
          fullCountryFeature = countriesGeoJSON.features.find(
            (feature) =>
              feature.properties?.ADMIN?.trim()?.toLowerCase() ===
              countryName.trim().toLowerCase()
          );
        }

        if (!fullCountryFeature) {
          console.warn('Country polygon not found for:', iso_a3, countryName);
          return;
        }

        pinsMarkersRef.current.forEach((m) => m.remove());
        pinsMarkersRef.current = [];
        setPopupData(null);

        const { data } = await supabase
          .from('pins')
          .select('*')
          .eq('countryName', countryName.trim());

        if (data?.length) {
          data.forEach((pin) => {
            const marker = new mapboxgl.Marker({ color: '#a45ee5'})
              .setLngLat([pin.longitude, pin.latitude])
              .addTo(map);

            marker.getElement().style.cursor = 'pointer';
            marker.getElement().addEventListener('click', (ev) => {
              ev.stopPropagation();
              setPopupData({
                title: pin.title || 'No title',
                description: pin.description || 'No description',
                longitude: pin.longitude,
                latitude: pin.latitude,
              });
            });

            pinsMarkersRef.current.push(marker);
          });
        }

        const bbox = turf.bbox(fullCountryFeature);
        setCountryBBox(bbox);

        const center = turf.center(fullCountryFeature).geometry.coordinates;
        map.panTo(center);

        map.setFilter('highlighted-country-fill', ['==', ['get', 'iso_3166_1_alpha_3'], iso_a3]);
        map.setFilter('highlighted-country-border', ['==', ['get', 'iso_3166_1_alpha_3'], iso_a3]);
      });

      map.on('click', async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['poi-label', 'place-label'],
        });

        if (!features.length) return;
        const poi = features[0];
        const name = poi.properties.name || poi.text;
        const lngLat = e.lngLat;

        const confirm = window.confirm(`Do you want to save "${name}" as a pin?`);
        if (!confirm) return;

        const { error } = await supabase.from('pins').insert([
          {
            countryName: currentCountry || 'Unknown',
            title: name,
            description: poi.properties.class || '',
            latitude: lngLat.lat,
            longitude: lngLat.lng,
          },
        ]);

        if (error) {
          alert('Failed to save pin.');
          console.error(error);
        } else {
          alert('Pin saved!');
          const marker = new mapboxgl.Marker({ color: 'green' })
            .setLngLat([lngLat.lng, lngLat.lat])
            .addTo(map);
          pinsMarkersRef.current.push(marker);
        }
      });
    });

    return () => {
      pinsMarkersRef.current.forEach((m) => m.remove());
      pinsMarkersRef.current = [];
      if (mapRef.current) mapRef.current.remove();
    };
  }, [accessToken]);

  useEffect(() => {
    if (!searchLocation || !mapRef.current) return;
    const { lng, lat } = searchLocation;

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }

    const marker = new mapboxgl.Marker({ color: 'red' })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);
    searchMarkerRef.current = marker;

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 12,
      essential: true,
    });

    mapRef.current.setFilter('highlighted-country-fill', ['==', ['get', 'iso_3166_1_alpha_3'], '']);
    mapRef.current.setFilter('highlighted-country-border', ['==', ['get', 'iso_3166_1_alpha_3'], '']);

    pinsMarkersRef.current.forEach((m) => m.remove());
    pinsMarkersRef.current = [];
    setPopupData(null);
  }, [searchLocation]);

  return (
    <>
      <div id="map" />
      {popupData && (
        <PopupComponent data={popupData} onClose={() => setPopupData(null)} />
      )}
    </>
  );
};

export default MapComponent;
