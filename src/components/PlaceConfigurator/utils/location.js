export async function fetchContinent(countryName) {
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const [record] = await res.json();
  return record?.region || null;
}