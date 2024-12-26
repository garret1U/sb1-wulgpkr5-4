import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { LocationMarker } from './LocationMarker';
import { LocationPopup } from './LocationPopup';
import { getEnvironmentVariable } from '../../lib/api';
import type { Location } from '../../types';

declare global {
  interface Window {
    atlas: typeof atlas;
  }
}

interface LocationMapProps {
  locations: Location[];
  selectedLocationId?: string;
  onLocationSelect?: (locationId: string) => void;
}

export function LocationMap({ locations, selectedLocationId, onLocationSelect }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<atlas.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [dataSource, setDataSource] = useState<atlas.source.DataSource | null>(null);
  const [symbolLayer, setSymbolLayer] = useState<atlas.layer.SymbolLayer | null>(null);
  const [activePopup, setActivePopup] = useState<atlas.Popup | null>(null);

  // Filter valid locations with coordinates
  const validLocations = React.useMemo(() => 
    locations.filter(l => {
      const lon = parseFloat(l.longitude || '');
      const lat = parseFloat(l.latitude || '');
      return !isNaN(lon) && !isNaN(lat) && 
             lon >= -180 && lon <= 180 && 
             lat >= -90 && lat <= 90;
    }),
    [locations]
  );

  const { data: azureMapsKey } = useQuery({
    queryKey: ['azureMapsKey'],
    queryFn: () => getEnvironmentVariable('AZURE_MAPS_KEY')
  });

  // Create map instance
  // Initialize map
  useEffect(() => {
    if (!azureMapsKey || !mapRef.current || !window.atlas) return;

    const map = new window.atlas.Map(mapRef.current, {
      authOptions: {
        authType: 'subscriptionKey',
        subscriptionKey: azureMapsKey
      },
      center: [-95.7129, 37.0902], // Center of USA
      zoom: 3,
      style: 'road_dark',
      language: 'en-US'
    });

    map.events.add('ready', () => {
      const source = new window.atlas.source.DataSource();
      map.sources.add(source);
      
      const layer = new window.atlas.layer.SymbolLayer(source, null, {
        iconOptions: {
          allowOverlap: true,
          anchor: 'center',
          size: 1
        },
        filter: ['has', 'icon']
      });
      map.layers.add(layer);

      setDataSource(source);
      setSymbolLayer(layer);
      setIsMapReady(true);
    });

    mapInstanceRef.current = map;

    return () => {
      map.dispose();
      mapInstanceRef.current = null;
      setDataSource(null);
      setSymbolLayer(null);
      setIsMapReady(false);
    };
  }, [azureMapsKey]);

  // Update markers and bounds
  useEffect(() => {
    if (!isMapReady || !dataSource || !symbolLayer || !mapInstanceRef.current) return;

    // Clear existing data
    dataSource.clear();

    if (validLocations.length === 0) return;

    // Close any existing popup
    if (activePopup) {
      activePopup.close();
      setActivePopup(null);
    }

    // Add markers and collect positions for bounds
    const positions: [number, number][] = [];
    for (const location of validLocations) {
      const lon = parseFloat(location.longitude!);
      const lat = parseFloat(location.latitude!);
      const coordinates = [lon, lat];

      // Add point to data source
      const point = new window.atlas.data.Feature(
        new window.atlas.data.Point(coordinates),
        {
          id: location.id,
          name: location.name,
          icon: LocationMarker({
            criticality: location.criticality,
            selected: location.id === selectedLocationId
          }),
          coordinates,
          selected: location.id === selectedLocationId
        }
      );
      dataSource.add(point);
      positions.push(coordinates);
    }

    // Calculate bounds using Azure Maps helper
    const bounds = window.atlas.data.BoundingBox.fromPositions(positions);

    // Close any existing popup
    activePopup?.close();

    // Set up event handlers
    mapInstanceRef.current.events.add('click', symbolLayer, (e: any) => {
      if (e.shapes && e.shapes[0]) {
        const properties = e.shapes[0].getProperties();
        const popup = new window.atlas.Popup({
          content: LocationPopup({ location: locations.find(l => l.id === properties.id)! }),
          pixelOffset: [0, -20],
          closeButton: false
        }); 
        
        setActivePopup(popup);
        popup.open(mapInstanceRef.current!);
        popup.setOptions({ position: properties.coordinates });
        onLocationSelect?.(properties.id);
      }
    });
    // Add hover effects
    mapInstanceRef.current.events.add('mouseover', symbolLayer, () => {
      mapInstanceRef.current!.getCanvas().style.cursor = 'pointer';
    });

    mapInstanceRef.current.events.add('mouseout', symbolLayer, () => {
      mapInstanceRef.current!.getCanvas().style.cursor = 'grab';
    });

    // Fit map to show all locations
    mapInstanceRef.current.setCamera({
      bounds: bounds,
      padding: 50,
      type: 'ease',
      duration: 1000
    });
  }, [isMapReady, validLocations, selectedLocationId, onLocationSelect, dataSource, symbolLayer, activePopup]);
  
  // Handle selected location
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !selectedLocationId) return;

    const selectedLocation = locations.find(l => l.id === selectedLocationId);
    if (!selectedLocation?.longitude || !selectedLocation?.latitude) return;

    const lon = parseFloat(selectedLocation.longitude); 
    const lat = parseFloat(selectedLocation.latitude);
    
    if (isNaN(lon) || isNaN(lat)) return;

    mapInstanceRef.current.setCamera({
      center: [lon, lat],
      zoom: 12,
      type: 'ease',
      duration: 1000
    });
  }, [isMapReady, selectedLocationId, locations]);

  if (!azureMapsKey) {
    return (
      <div className="w-full h-[400px] rounded-lg shadow-md border border-gray-200 dark:border-gray-700 
                    flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
          <MapPin className="h-8 w-8 mb-2" />
          <p>Azure Maps integration is currently disabled</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef}
      className="w-full h-[400px] rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
    />
  );
}