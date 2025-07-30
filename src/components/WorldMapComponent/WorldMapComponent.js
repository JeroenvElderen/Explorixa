import React, {
  forwardRef,
  memo,
  useState,
  useImperativeHandle,
  useCallback,
  useEffect,
} from 'react';
import MapContainer from './MapContainer';
import usePins from '../../hooks/usePins';
import { createClusterCanvas } from './marker/createClusterCanvas';
import { createMarkerCanvas } from './marker/createMarkerCanvas';
import PoiClickHandler from './layers/PoiClickHandler';
import PopupComponent from './PopupComponent';
import { countryColors } from './constants';

// in‑module cache for marker canvases
const markerCache = new Map();
function getMarkerImageData(iso) {
  if (markerCache.has(iso)) return markerCache.get(iso);
  const hex = countryColors[iso] || countryColors.default;
  const label = iso === 'PEAK' ? '🏔️' : iso;
  const canvas = createMarkerCanvas(hex, label);
  const imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  markerCache.set(iso, imgData);
  return imgData;
}

const WorldMapComponent = forwardRef(function WorldMapComponent(
  { accessToken, selectingPoint, onMapClick, onPoiClick, target, flyOnTarget },
  ref
) {
  const features = usePins();
  // debug: do we actually have any pins?
  console.log('🔔 usePins returned', features.length, 'features');

  const [map, setMap] = useState(null);
  const [popup, setPopup] = useState(null);

  // expose removePinFromMap
  useImperativeHandle(
    ref,
    () => ({
      removePinFromMap(id) {
        const src = map?.getSource('pins');
        if (!src?._data) return;
        const remaining = src._data.features.filter(f => f.properties.pinId !== id);
        src.setData({ ...src._data, features: remaining });
      },
    }),
    [map]
  );

  // 1) onLoad → source + layers
  const handleLoad = useCallback(
    m => {
      setMap(m);
      // add empty source
      m.addSource('pins', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterRadius: 60,
      });

      // cluster icon
      const CID = 'cluster-icon';
      if (m.hasImage(CID)) m.removeImage(CID);
      const cc = createClusterCanvas('#F18F01');
      const cd = cc.getContext('2d').getImageData(0, 0, cc.width, cc.height);
      m.addImage(CID, cd);

      // pick first symbol layer to insert above
      const firstSymbolId = m.getStyle().layers.find(l => l.type === 'symbol')?.id;

      // clusters
      m.addLayer(
        {
          id: 'clusters',
          type: 'symbol',
          source: 'pins',
          filter: ['has', 'point_count'],
          layout: {
            'icon-image': CID,
            'icon-allow-overlap': true,
            'icon-anchor': 'center',
            'icon-size': [
              'step',
              ['get', 'point_count'],
              1.2,
              10, 1.5,
              30, 2,
              70, 2.5,
              200, 3,
            ],
          },
        },
        firstSymbolId
      );

      // cluster count
      m.addLayer(
        {
          id: 'cluster-count',
          type: 'symbol',
          source: 'pins',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: { 'text-color': '#fff' },
        },
        firstSymbolId
      );

      // unclustered
      m.addLayer(
        {
          id: 'unclustered-point',
          type: 'symbol',
          source: 'pins',
          filter: ['!', ['has', 'point_count']],
          layout: {
            'icon-image': ['concat', 'marker-', ['get', 'iso']],
            'icon-allow-overlap': true,
            'icon-anchor': 'bottom',
          },
        },
        firstSymbolId
      );

      // expand cluster on click
      m.on('click', 'clusters', e => {
        const clusterId = e.features[0].properties.cluster_id;
        m.getSource('pins').getClusterExpansionZoom(clusterId, (err, z) => {
          if (!err) m.easeTo({ center: e.lngLat, zoom: z });
        });
      });
    },
    []
  );

  // 2) whenever features change → register marker images & setData
  useEffect(() => {
    if (!map) return;
    const src = map.getSource('pins');
    if (!src) return;

    const existing = map.listImages();
    const isos = Array.from(new Set(features.map(f => f.properties.iso)));
    isos.forEach(iso => {
      const imgId = `marker-${iso}`;
      if (!existing.includes(imgId)) {
        map.addImage(imgId, getMarkerImageData(iso));
      }
    });

    src.setData({ type: 'FeatureCollection', features });
  }, [map, features]);

  // 3) raw‐map click
  useEffect(() => {
    if (!map) return;
    const cb = e => {
      if (selectingPoint) onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    map.on('click', cb);
    return () => map.off('click', cb);
  }, [map, selectingPoint, onMapClick]);

  // 4) clicking a marker → popup
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
    map.on('click', 'unclustered-point', handler);
    const canvas = map.getCanvas?.();
    if (canvas?.style) canvas.style.cursor = 'pointer';
    return () => {
      map.off('click', 'unclustered-point', handler);
      if (canvas?.style) canvas.style.cursor = '';
    };
  }, [map]);

  // 5) fly to target
  useEffect(() => {
    if (map && flyOnTarget && target?.lng != null && target?.lat != null) {
      map.flyTo({ center: [target.lng, target.lat], zoom: Math.max(map.getZoom(), 4) });
    }
  }, [map, flyOnTarget, target]);

  return (
    <>
      <MapContainer
        accessToken={accessToken}
        onLoad={handleLoad}
        projection="mercator"
      />

      {map && (
        <PoiClickHandler map={map} accessToken={accessToken} onPoiClick={onPoiClick} />
      )}

      {popup && <PopupComponent data={popup} onClose={() => setPopup(null)} />}
    </>
  );
});

export default memo(WorldMapComponent);
