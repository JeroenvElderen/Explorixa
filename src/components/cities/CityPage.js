// What to do in this component //

// 1.

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "SupabaseClient"; // update as needed

export default function CityPage() {
  const { cityId } = useParams();
  const [city, setCity] = useState(null);

  useEffect(() => {
    const fetchCity = async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .eq("Name", cityId)
        .single();
      if (!error) setCity(data);
    };

    fetchCity();
  }, [cityId]);

  if (!city) return <div>Loading...</div>;

  return (
    <div>
      <h1>{city.Name}</h1>
      <p>Population: {city.Population}</p>
      <p>Country: {city.Country}</p>
      {/* add other fields as needed */}
    </div>
  );
}
