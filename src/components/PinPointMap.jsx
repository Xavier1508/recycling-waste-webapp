import React, { useState, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { locationAPI } from '@/services/api';
import { PulseLoader } from 'react-spinners';

// Fix ikon default Leaflet
const iconDefault = new L.Icon({
    iconUrl: '/marker-icon.png', iconRetinaUrl: '/marker-icon-2x.png', shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

// Komponen untuk menggeser peta saat lokasi berubah
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Komponen untuk Marker yang bisa digeser
function DraggableMarker({ position, setPosition }) {
  const markerRef = useRef(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        setPosition(marker.getLatLng());
      }
    },
  }), [setPosition]);

  return (
    <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef}></Marker>
  );
}


const PinPointMap = ({ initialPosition, onConfirmLocation, onCancel }) => {
  const [position, setPosition] = useState(initialPosition);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef(null);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (query.length > 3) {
      setIsSearching(true);
      debounceTimeout.current = setTimeout(async () => {
        try {
          const response = await locationAPI.getAutocomplete(query);
          setSuggestions(response.data || []);
        } catch (error) { console.error("Autocomplete error:", error); }
        finally { setIsSearching(false); }
      }, 500);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const newPos = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    setPosition(newPos);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl flex flex-col h-[90vh]">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Tentukan Titik Lokasi</h3>
        <p className="text-sm text-gray-500 mb-4">Gunakan pencarian untuk menuju area, lalu geser pin ke lokasi yang paling akurat.</p>
        
        {/* Search Bar */}
        <div className="relative mb-2">
            <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Cari nama jalan atau area..." className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm"/>
            {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><PulseLoader size={6} color="#d93d41" /></div>}
            {suggestions.length > 0 && (
                <div className="absolute w-full border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto z-[1001] bg-white shadow-lg">
                    {suggestions.map(s => (<div key={s.place_id} onClick={() => handleSuggestionClick(s)} className="p-2.5 cursor-pointer hover:bg-gray-100 text-sm">{s.display_name}</div>))}
                </div>
            )}
        </div>

        {/* Map Container */}
        <div className="flex-grow rounded-md overflow-hidden z-10">
            <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={position} zoom={16} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                <DraggableMarker position={position} setPosition={setPosition} />
            </MapContainer>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button onClick={() => onConfirmLocation(position)} className="w-full bg-[#7c1215] text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-[#a03236]">Konfirmasi Lokasi</button>
          <button onClick={onCancel} className="w-full bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-300">Batal</button>
        </div>
      </div>
    </div>
  );
};

export default PinPointMap;