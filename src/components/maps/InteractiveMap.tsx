import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPin, Navigation, Route, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { gsap } from 'gsap';

interface MapLocation {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'destination' | 'accommodation' | 'activity' | 'transport';
  color: string;
  description?: string;
}

interface InteractiveMapProps {
  locations: MapLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onLocationClick?: (location: MapLocation) => void;
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
  showRoute?: boolean;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locations,
  center = { lat: 48.8566, lng: 2.3522 }, // Default to Paris
  zoom = 10,
  onLocationClick,
  onMapClick,
  showRoute = false,
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [mapCenter, setMapCenter] = useState(center);

  useEffect(() => {
    if (mapRef.current) {
      // Initialize map animation
      gsap.fromTo(mapRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
    setMapCenter(location.coordinates);
    onLocationClick?.(location);
  };

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1));
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'destination': return '🏛️';
      case 'accommodation': return '🏨';
      case 'activity': return '🎯';
      case 'transport': return '🚗';
      default: return '📍';
    }
  };

  // Mock map implementation (in real app, you'd use Google Maps, Mapbox, etc.)
  const renderMockMap = () => (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-green-200/20">
        <svg className="w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Locations */}
      {locations.map((location, index) => (
        <div
          key={location.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
            selectedLocation?.id === location.id ? 'scale-125 z-10' : 'z-5'
          }`}
          style={{
            left: `${20 + (index * 15) % 60}%`,
            top: `${30 + (index * 10) % 40}%`,
          }}
          onClick={() => handleLocationClick(location)}
        >
          <div className={`w-8 h-8 ${location.color} rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white`}>
            <span className="text-sm">{getLocationIcon(location.type)}</span>
          </div>
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
            {location.name}
          </div>
        </div>
      ))}

      {/* Route Lines (if enabled) */}
      {showRoute && locations.length > 1 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {locations.slice(0, -1).map((location, index) => (
            <line
              key={`route-${index}`}
              x1={`${20 + (index * 15) % 60}%`}
              y1={`${30 + (index * 10) % 40}%`}
              x2={`${20 + ((index + 1) * 15) % 60}%`}
              y2={`${30 + ((index + 1) * 10) % 40}%`}
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          ))}
        </svg>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button variant="glass" size="sm" icon={ZoomIn} onClick={handleZoomIn} />
        <Button variant="glass" size="sm" icon={ZoomOut} onClick={handleZoomOut} />
        <Button variant="glass" size="sm" icon={Layers} />
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 glass-card px-3 py-1 rounded-lg">
        <span className="text-sm text-white">Zoom: {mapZoom}</span>
      </div>
    </div>
  );

  return (
    <Card className={className} glow>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Interactive Map
        </h3>
        <div className="flex space-x-2">
          <Button 
            variant={showRoute ? "primary" : "ghost"} 
            size="sm" 
            icon={Route}
          >
            Route
          </Button>
          <Button variant="ghost" size="sm" icon={Navigation} />
        </div>
      </CardHeader>
      <CardContent ref={mapRef}>
        {renderMockMap()}
        
        {/* Location Details Panel */}
        {selectedLocation && (
          <div className="mt-4 glass-card p-4 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${selectedLocation.color} rounded-full flex items-center justify-center text-white`}>
                  <span>{getLocationIcon(selectedLocation.type)}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">{selectedLocation.name}</h4>
                  <p className="text-sm text-white/60 capitalize">{selectedLocation.type}</p>
                  {selectedLocation.description && (
                    <p className="text-sm text-white/70 mt-1">{selectedLocation.description}</p>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedLocation(null)}
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-white/70">Destinations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-white/70">Accommodations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-white/70">Activities</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-white/70">Transportation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};