// POIHandler.js
export async function handlePoiClick(map, e, geocoder, onPoiClick) {
  const feat = e.features[0];
  const [lng, lat] = e.lngLat.toArray();
  const props = feat.properties || {};

  const name = props.name_en || props.name || props.text || "";
  const category = props.category || props.subcategory || props.classification || "";
  const natural = props.natural || "";
  const maki = props.maki || "";

  let city = "";
  let address = "";

  const isMountainPeak =
    /peak|mountain|hill|ridge|summit/i.test(category) ||
    /peak|mountain|hill|ridge|summit/i.test(natural) ||
    /peak|mountain|hill|ridge|summit/i.test(maki);

  if (name && geocoder) {
    try {
      const response = await geocoder.forwardGeocode({
        query: name,
        limit: 1,
      }).send();

      if (response.body.features.length > 0) {
        address = response.body.features[0].place_name;
      }
    } catch (err) {
      console.warn("Mapbox geocoding error:", err);
    }
  }

  if (!address || !city) {
    try {
      const osmUrl =
        `https://nominatim.openstreetmap.org/reverse`
        + `?format=json&addressdetails=1`
        + `&lat=${lat}&lon=${lng}`
        + `&zoom=14`;

      const osm = await fetch(osmUrl).then(r => r.json());
      const addr = osm.address || {};
      city = addr.village || addr.town || addr.city || addr.county || "";
      address = address || osm.display_name;
    } catch (err) {
      console.warn("OSM reverse geocode error:", err);
    }
  }

  onPoiClick({
    name,
    text: name,
    landmark: name,
    category,
    lat,
    lng,
    city: isMountainPeak ? "" : city,
    iso: isMountainPeak ? "PEAK" : undefined,
    address,
  });
}
