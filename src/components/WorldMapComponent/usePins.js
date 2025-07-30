// src/components/WorldMapComponent/usePins.js

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../SupabaseClient";
import { countryNameToIso } from "./constants";

export default function usePins() {
  const [features, setFeatures] = useState([]);
  const rendered = useRef(new Set());

  useEffect(() => {
    async function fetchAndSet() {
      const { data: pins, error } = await supabase
        .from("pins")
        .select("*, countryName")
        .order("created_at", { ascending: true });
      if (error || !pins) return;

      const ids = new Set(pins.map(p => p.id));
      const isNew = [...ids].some(id => !rendered.current.has(id));
      if (!isNew) return;

      rendered.current = ids;
      setFeatures(
        pins.map(pin => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [pin.longitude, pin.latitude],
          },
          properties: {
            pinId: pin.id,
            title: pin.Name,
            description: pin.Information,
            imageurl: pin["Main Image"],
            date: pin.created_at,
            iso: pin.iso || countryNameToIso[pin.countryName] || "default",
            countryName: pin.countryName,
          },
        }))
      );
    }

    fetchAndSet();
    
    const channel = supabase
        .channel("pins-updates")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "pins" },
            () => {
              fetchAndSet();
            } 
        )
        .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

  return features;
}
