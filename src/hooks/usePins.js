// src/hooks/usePins.js
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../SupabaseClient';
import { countryNameToIso } from '../components/WorldMapComponent/constants';

export default function usePins(pollInterval = 5000) {
  const [features, setFeatures] = useState([]);
  const rendered = useRef(new Set());

  useEffect(() => {
    async function fetchPins() {
      const { data: pins, error } = await supabase
        .from('pins')
        .select('*, countryName')
        .order('created_at', { ascending: true });
      if (error) {
        console.error('❌ supabase error fetching pins:', error);
        return;
      }
      const ids = new Set(pins.map(p => p.id));
      const isNew = [...ids].some(id => !rendered.current.has(id));
      if (!isNew) return;
      rendered.current = ids;

      const feats = pins.map(pin => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [pin.longitude, pin.latitude] },
        properties: {
          pinId: pin.id,
          title: pin.Name,
          description: pin.Information,
          imageurl: pin['Main Image'],
          date: pin.created_at,
          iso: pin.iso || countryNameToIso[pin.countryName] || 'default',
          countryName: pin.countryName,
        },
      }));
      console.log('✅ fetched', feats.length, 'pins');
      setFeatures(feats);
    }

    fetchPins();
    const timer = setInterval(fetchPins, pollInterval);
    return () => clearInterval(timer);
  }, [pollInterval]);

  return features;
}
