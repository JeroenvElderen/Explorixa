// src/components/CountryPage/helpers.js

export function truncate(text, maxLength) {
  if (!text) return "";
  const plainText = text.replace(/<[^>]+>/g, "");
  return plainText.length > maxLength ? plainText.substring(0, maxLength) + "…" : plainText;
}

export function timeAgo(date) {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  if (diffMs < 0) return "Just now";
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export const weatherEmoji = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Snow: "❄️",
  Thunderstorm: "⛈️",
  Drizzle: "🌦️",
  Mist: "🌫️",
  Smoke: "💨",
  Haze: "🌁",
  Dust: "🏜️",
  Ash: "🌋",
  Squall: "🌬️",
  Tornado: "🌪️",
};
