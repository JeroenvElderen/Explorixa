import React, {
  forwardRef,
  memo,
  useState,
  useImperativeHandle,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import MapContainer from './MapContainer';
import usePins from '../../hooks/usePins';
import { createClusterCanvas } from './marker/createClusterCanvas';
import { createMarkerCanvas } from './marker/createMarkerCanvas';
import PoiClickHandler from './layers/PoiClickHandler';
import PopupComponent from './PopupComponent';
import { countryColors } from './constants';

// in-module cache for marker canvases
const markerCache = new Map();
function getMarkerImageData(iso) {
  if (markerCache.has(iso)) return markerCache.get(iso);
  const hex = countryColors[iso] || countryColors.default;
  const label = iso === 'PEAK' ? '🏔️' : iso;
  const canvas = createMarkerCanvas(hex, label);
  const imgData = canvas
    .getContext('2d')
    .getImageData(0, 0, canvas.width, canvas.height);
  markerCache.set(iso, imgData);
  return imgData;
}

const CLUSTER_ICON_ID = 'cluster-icon';

const WorldMapComponent = forwardRef(function WorldMapComponent(
  { accessToken, selectingPoint, onMapClick, onPoiClick, target, flyOnTarget },
  ref
) {
  const features = usePins();
  const [map, setMap] = useState(null);
  const [popup, setPopup] = useState(null);

  // track if user is interacting (dragging) to avoid flyTo fights
  const isUserInteracting = useRef(false);
  useEffect(() => {
    if (!map) return;
    const onDragStart = () => {
      isUserInteracting.current = true;
    };
    const onDragEnd = () => {
      setTimeout(() => {
        isUserInteracting.current = false;
      }, 200);
    };
    map.on('dragstart', onDragStart);
    map.on('dragend', onDragEnd);
    return () => {
      map.off('dragstart', onDragStart);
      map.off('dragend', onDragEnd);
    };
  }, [map]);

  // expose removePinFromMap (public API)
  useImperativeHandle(
    ref,
    () => ({
      removePinFromMap(id) {
        if (!map) return;
        const src = map.getSource('pins');
        if (!src) return;
        // fallback to internal _data if needed; filter out pin
        const currentFeatures = src._data?.features || [];
        const remaining = currentFeatures.filter(f => f.properties.pinId !== id);
        map.getSource('pins')?.setData({
          type: 'FeatureCollection',
          features: remaining,
        });
      },
    }),
    [map]
  );

  // 1) onLoad → source + base images + layers
  const handleLoad = useCallback(
    m => {
      setMap(m);

      if (!m.getSource('pins')) {
        m.addSource('pins', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterRadius: 60,
        });
      }

      // cluster icon
      if (m.hasImage(CLUSTER_ICON_ID)) m.removeImage(CLUSTER_ICON_ID);
      const cc = createClusterCanvas('#F18F01');
      const cd = cc.getContext('2d').getImageData(0, 0, cc.width, cc.height);
      m.addImage(CLUSTER_ICON_ID, cd);

      // pick first symbol to insert above
      const firstSymbolId = m
        .getStyle()
        .layers.find(l => l.type === 'symbol')?.id;

      if (!m.getLayer('clusters')) {
        m.addLayer(
          {
            id: 'clusters',
            type: 'symbol',
            source: 'pins',
            filter: ['has', 'point_count'],
            layout: {
              'icon-image': CLUSTER_ICON_ID,
              'icon-allow-overlap': true,
              'icon-anchor': 'center',
              'icon-size': [
                'step',
                ['get', 'point_count'],
                1.2,
                10,
                1.5,
                30,
                2,
                70,
                2.5,
                200,
                3,
              ],
            },
          },
          firstSymbolId
        );
      }

      if (!m.getLayer('cluster-count')) {
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
      }

      if (!m.getLayer('unclustered-point')) {
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
      }

      // expand cluster on click
      m.on('click', 'clusters', e => {
        if (!e.features || !e.features[0]) return;
        const clusterId = e.features[0].properties.cluster_id;
        m.getSource('pins')?.getClusterExpansionZoom(clusterId, (err, z) => {
          if (!err) m.easeTo({ center: e.lngLat, zoom: z });
        });
      });
    },
    []
  );

  // 2) features → ensure marker images + source data
  useEffect(() => {
    if (!map) return;
    const src = map.getSource('pins');
    if (!src) return;

    const existing = map.listImages();
    const isos = Array.from(new Set(features.map(f => f.properties.iso || 'default')));
    isos.forEach(iso => {
      const imgId = `marker-${iso}`;
      if (!existing.includes(imgId)) {
        map.addImage(imgId, getMarkerImageData(iso));
      }
    });

    map.getSource('pins')?.setData({
      type: 'FeatureCollection',
      features,
    });
  }, [map, features]);

  // 3) raw-map click (selecting point)
  useEffect(() => {
    if (!map) return;
    const cb = e => {
      if (!selectingPoint) return;
      onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    map.on('click', cb);
    return () => map.off('click', cb);
  }, [map, selectingPoint, onMapClick]);

  // 4) unclustered-point click → popup (defensive)
  useEffect(() => {
    if (!map) return;
    const handler = e => {
      if (!e.features || !e.features[0]) return;
      const feat = e.features[0];
      if (!feat.geometry || !Array.isArray(feat.geometry.coordinates)) return;
      const [lng, lat] = feat.geometry.coordinates;
      const p = feat.properties || {};
      setPopup({
        title: p.title,
        description: p.description,
        imageurl: p.imageurl,
        date: p.date,
        longitude: lng,
        latitude: lat,
        countryName: p.countryName,
        id: p.pinId,
        Information: p.Information,
        been_there: p.been_there,
        want_to_go: p.want_to_go,
        saved_count: p.saved_count,
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

  // 5) fly to target (avoid interrupting user)
  useEffect(() => {
    if (
      map &&
      flyOnTarget &&
      target?.lng != null &&
      target?.lat != null &&
      !isUserInteracting.current
    ) {
      map.flyTo({
        center: [target.lng, target.lat],
        zoom: Math.max(map.getZoom(), 4),
      });
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
