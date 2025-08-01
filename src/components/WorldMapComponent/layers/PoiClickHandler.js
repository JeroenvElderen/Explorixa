import { useEffect } from 'react';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

export default function PoiClickHandler({ map, accessToken, onPoiClick }) {
  useEffect(() => {
    if (!map) return;

    const geocoder = mbxGeocoding({ accessToken });

    // Helper to process a feature manually (used for fallback)
    const processFeature = async (feat, lngLat) => {
      if (!feat) return;
      const props = feat.properties || {};
      const [lng, lat] = lngLat.toArray();
      const name = props.name_en || props.name || props.text || '';
      const category =
        props.category || props.subcategory || props.classification || '';
      const natural = props.natural || '';
      const maki = props.maki || '';
      const isPeak = /peak|mountain|hill|ridge|summit/i.test(
        category + natural + maki
      );

      let address = '';
      let city = '';

      try {
        if (name) {
          const res = await geocoder
            .forwardGeocode({
              query: name,
              limit: 1,
              proximity: { longitude: lng, latitude: lat },
            })
            .send();
          if (res?.body?.features?.length) {
            address = res.body.features[0].place_name || '';
          }
        }
      } catch (err) {
        console.warn('geocoder failed', err);
      }

      if (!address) {
        try {
          const osm = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`
          ).then(r => r.json());
          address = osm.display_name || '';
          const addr = osm.address || {};
          city = addr.village || addr.town || addr.city || '';
        } catch (err) {
          console.warn('OSM reverse geocode failed', err);
        }
      }

      onPoiClick({
        name,
        landmark: name,
        category,
        lat,
        lng,
        city: isPeak ? '' : city,
        iso: isPeak ? 'PEAK' : undefined,
        address,
      });
    };

    const tryHandleClick = async e => {
      if (!e || !e.lngLat) return;
      // prefer the feature from the layer if available
      if (e.features && e.features[0]) {
        await processFeature(e.features[0], e.lngLat);
        return;
      }
      // fallback: manual query (helps when mobile suppresses layer click)
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['poi-label', 'natural-point-label'],
      });
      if (features.length) {
        await processFeature(features[0], e.lngLat);
      }
    };

    // attach to intended layers
    const style = map.getStyle();
    const poiLayer = style?.layers?.find(l => l.id.includes('poi-label'))?.id;
    const natLayer = style?.layers?.find(l =>
      l.id.includes('natural-point-label')
    )?.id;

    if (poiLayer) map.on('click', poiLayer, tryHandleClick);
    if (natLayer) map.on('click', natLayer, tryHandleClick);

    // Mobile fallback: listen for touchend and manually probe under finger
    const canvas = map.getCanvas();
    let touchTimeout = null;
    const onTouchEnd = e => {
      if (!map) return;
      // prevent double-handling if the map already fired click
      clearTimeout(touchTimeout);
      const touch = e.changedTouches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      const point = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
      const lngLat = map.unproject([point.x, point.y]);
      // create a synthetic event-like object
      const fakeEvent = {
        point: [point.x, point.y],
        lngLat,
      };
      // Query for POI features manually to catch taps that missed layer click
      const features = map.queryRenderedFeatures([point.x, point.y], {
        layers: [poiLayer, natLayer].filter(Boolean),
      });
      if (features.length) {
        processFeature(features[0], lngLat);
      }
    };
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      if (poiLayer) map.off('click', poiLayer, tryHandleClick);
      if (natLayer) map.off('click', natLayer, tryHandleClick);
      canvas.removeEventListener('touchend', onTouchEnd);
      if (touchTimeout) clearTimeout(touchTimeout);
    };
  }, [map, accessToken, onPoiClick]);

  return null;
}
