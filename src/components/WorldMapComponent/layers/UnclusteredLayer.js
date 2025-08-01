import { useEffect } from 'react';

export default function UnclusteredLayer({ map, features }) {
  useEffect(() => {
    if (!map || !map.getSource('pins')) return;
    if (map.getLayer('unclustered-point')) return;

    const isos = [...new Set(features.map(f => f.properties.iso))];
    const allImagesRegistered = isos.every(iso =>
      map.hasImage(`marker-${iso}`)
    );
    if (!allImagesRegistered) {
      console.warn('[UnclusteredLayer] waiting for marker images to be ready', isos);
      return;
    }

    map.addLayer({
      id: 'unclustered-point',
      type: 'symbol',
      source: 'pins',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': ['concat', 'marker-', ['get', 'iso']],
        'icon-allow-overlap': true,
        'icon-anchor': 'bottom',
      },
    });
  }, [map, features]);

  return null;
}
