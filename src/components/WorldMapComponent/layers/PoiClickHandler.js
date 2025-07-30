// layers/PoiClickHandler.jsx
import { useEffect } from "react";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

export default function PoiClickHandler({ map, accessToken, onPoiClick }) {
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const style = map.getStyle();
    if (!style.layers) return;

    const geocoder = mbxGeocoding({ accessToken });
    const poiLayer = style.layers.find(l => l.id.includes("poi-label"));
    const natLayer = style.layers.find(l => l.id.includes("natural-point-label"));

    function handleClick(e, layerId) {
      const feat = e.features[0];
      const props = feat.properties || {};
      const [lng, lat] = e.lngLat.toArray();
      const name = props.name_en || props.name || props.text || "";
      const category = props.category || props.subcategory || props.classification || "";
      const natural = props.natural || "";
      const maki = props.maki || "";
      const isPeak = /peak|mountain|hill|ridge|summit/i.test(category + natural + maki);
      let city = "";
      let address = "";

      async function fetchAddress() {
        if (name) {
          try {
            const res = await geocoder.forwardGeocode({
              query: name,
              limit: 1,
              proximity: { longitude: lng, latitude: lat },
            }).send();
            if (res.body.features.length) {
              address = res.body.features[0].place_name;
            }
          } catch {}
        }
        if (!address) {
          try {
            const osm = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`
            ).then(r => r.json());
            address = osm.display_name || "";
            const addr = osm.address || {};
            city = addr.village || addr.town || addr.city || "";
          } catch {}
        }

        onPoiClick({
          name,
          landmark: name,
          category,
          lat,
          lng,
          city: isPeak ? "" : city,
          iso: isPeak ? "PEAK" : undefined,
          address,
        });
      }

      fetchAddress();
    }

    if (poiLayer) map.on("click", poiLayer.id, handleClick);
    if (natLayer) map.on("click", natLayer.id, handleClick);

    return () => {
      if (poiLayer) map.off("click", poiLayer.id, handleClick);
      if (natLayer) map.off("click", natLayer.id, handleClick);
    };
  }, [map, accessToken, onPoiClick]);
  return null;
}
