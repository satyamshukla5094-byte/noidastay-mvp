export const COLLEGES = [
  { name: "NIET", lat: 28.4639, lng: 77.4908 },
  { name: "Galgotias University", lat: 28.4516, lng: 77.5352 },
  { name: "Sharda University", lat: 28.4731, lng: 77.4828 },
  { name: "Bennett University", lat: 28.4506, lng: 77.5842 },
  { name: "GL Bajaj", lat: 28.4601, lng: 77.4921 },
];

export const LANDMARKS = [
  { name: "Pari Chowk", lat: 28.4671, lng: 77.5138 },
  { name: "Knowledge Park 2", lat: 28.4668, lng: 77.4977 },
  { name: "Jagat Farm", lat: 28.4784, lng: 77.5121 },
];

export function getGoogleCalendarUrl(title: string, date: string, location: string) {
  const start = new Date(date);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");
  
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Visit: " + title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent("NoidaStay Verified Visit Request")}&location=${encodeURIComponent(location)}&sf=true&output=xml`;
}
