// src/hooks/usePins.js
import { useState, useEffect, useRef } from "react";
import { supabase } from "../SupabaseClient";
import { countryNameToIso } from "../components/WorldMapComponent/constants";

export default function usePins() {
  const [features, setFeatures] = useState([]);
  const seen = useRef(new Set());

  // fetch current pins
  const fetchPins = async () => {
    const { data: pins, error } = await supabase
      .from("pins")
      .select("*, countryName")
      .order("created_at", { ascending: true });
    if (error || !pins) return;
    const ids = new Set(pins.map(p => p.id));
    // only update if there's something new
    const isNew = Array.from(ids).some(id => !seen.current.has(id));
    if (!isNew) return;

    seen.current = ids;
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
  };

  useEffect(() => {
    // initial fetch
    fetchPins();

    // subscribe to changes
    const channel = supabase
      .channel("public:pins")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pins" },
        () => {
          fetchPins();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return features;
}
