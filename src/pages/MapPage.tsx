import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import './MapPage.css';

const containerStyle = {
  width: '100%',
  height: '800px',
};

const MapPage: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyDFhrl3b0ke6e7bHENsBpRIaOvxmvIYF4c',
    libraries: ['places'],
  });

  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [markers, setMarkers] = useState<google.maps.places.PlaceResult[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<google.maps.places.PlaceResult | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
          });
        },
        () => {
          alert("Erro ao obter a localização. Verifique as permissões.");
        }
      );
    } else {
      alert("Geolocalização não é suportada pelo seu navegador.");
    }
  }, []);

  const findParking = () => {
    if (mapRef.current && currentLocation) {
      const service = new google.maps.places.PlacesService(mapRef.current);
      const request: google.maps.places.PlaceSearchRequest = {
        location: currentLocation,
        radius: 5000,
        type: 'parking',
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setMarkers(results);
        } else {
          alert("Nenhum estacionamento encontrado nas proximidades.");
        }
      });
    }
  };

  return isLoaded && currentLocation ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation}
        zoom={15}
        onLoad={onLoad}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{
              lat: marker.geometry!.location!.lat(),
              lng: marker.geometry!.location!.lng(),
            }}
            onClick={() => setSelectedMarker(marker)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{
              lat: selectedMarker.geometry!.location!.lat(),
              lng: selectedMarker.geometry!.location!.lng(),
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h2>{selectedMarker.name}</h2>
              {selectedMarker.vicinity && <p>{selectedMarker.vicinity}</p>}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <button className="find-parking-btn" onClick={findParking}>
        Buscar Estacionamentos
      </button>
    </>
  ) : (
    <div>Loading...</div>
  );
};

export default MapPage;
