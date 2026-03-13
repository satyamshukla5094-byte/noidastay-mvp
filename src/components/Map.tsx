"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Maximize2, Minimize2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js/Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Property {
  id: string;
  title: string;
  price: number;
  lat: number;
  lng: number;
  sector: string;
}

interface MapProps {
  properties: Property[];
  height?: string;
  className?: string;
}

// Map Updater Component to center map around pins
function MapUpdater({ properties }: { properties: Property[] }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const bounds = L.latLngBounds(properties.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, properties]);

  return null;
}

export default function Map({ properties, height = "400px", className = "" }: MapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Default center (Greater Noida)
  const center: [number, number] = [28.4744, 77.5040];

  const containerStyles = isFullscreen 
    ? "fixed inset-0 z-[100] h-screen w-screen bg-black" 
    : `relative z-0 rounded-2xl overflow-hidden shadow-sm border border-gray-200 ${className}`;

  return (
    <div style={!isFullscreen ? { height, width: '100%' } : {}} className={containerStyles}>
      <button 
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 right-4 z-[400] bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 text-gray-700 transition-colors border border-gray-200"
        title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
      >
        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
      </button>

      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={isFullscreen}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {properties.map((property) => (
          <Marker 
            key={property.id} 
            position={[property.lat, property.lng]}
            icon={icon}
          >
            <Popup>
              <div className="font-sans">
                <h3 className="font-semibold text-sm mb-1">{property.title}</h3>
                <p className="text-emerald-600 font-bold text-sm mb-1 z-50">₹{property.price.toLocaleString("en-IN")}</p>
                <p className="text-gray-500 text-xs">{property.sector}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapUpdater properties={properties} />
      </MapContainer>
    </div>
  );
}
