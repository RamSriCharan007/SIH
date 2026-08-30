import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { saveToStore, getAllFromStore } from '../utils/db';
import { useAuth } from './AuthContext';
import { useNetwork } from './NetworkContext';

const GpsContext = createContext(null);

// Maharashtra Rural Preset GPS Coordinates (for instant fallback / testing)
export const RURAL_GPS_PRESETS = {
  trimbak_pada: {
    id: 'trimbak_pada',
    name: 'Trimbakeshwar Pada No. 3 (Tribal Belt)',
    lat: 19.9381,
    lng: 73.5312,
    district: 'Nashik',
    taluka: 'Trimbakeshwar',
    village: 'Trimbak Pada 3'
  },
  igatpuri_tribal: {
    id: 'igatpuri_tribal',
    name: 'Karanjali Forest Pada (Igatpuri Block)',
    lat: 19.6967,
    lng: 73.5594,
    district: 'Nashik',
    taluka: 'Igatpuri',
    village: 'Karanjali Pada'
  },
  junnar_rural: {
    id: 'junnar_rural',
    name: 'Otur Phata (Junnar Rural Sector)',
    lat: 19.2083,
    lng: 73.8767,
    district: 'Pune Rural',
    taluka: 'Junnar',
    village: 'Otur Phata'
  },
  nashik_civil: {
    id: 'nashik_civil',
    name: 'Nashik District Civil Hospital Hub',
    lat: 19.9975,
    lng: 73.7898,
    district: 'Nashik Urban/Suburban',
    taluka: 'Nashik',
    village: 'Civil Lines'
  }
};

// Haversine formula
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

export function GpsProvider({ children }) {
  const { user } = useAuth();
  const { isOffline } = useNetwork();

  // Current Coordinates & Telemetry
  const [coordinates, setCoordinates] = useState({
    latitude: 19.9381,
    longitude: 73.5312,
    accuracy: 12.5,
    altitude: 620,
    speed: null,
    heading: null,
    timestamp: new Date().toISOString()
  });

  const [gpsStatus, setGpsStatus] = useState('locked'); // 'acquiring' | 'locked' | 'simulated' | 'error' | 'denied'
  const [activePreset, setActivePreset] = useState('trimbak_pada');
  const [nearestHospital, setNearestHospital] = useState(null);
  const [gpsLogs, setGpsLogs] = useState([]);
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [lastLoggedAt, setLastLoggedAt] = useState(null);
  const watchIdRef = useRef(null);

  // 1. Calculate nearest hospital given lat/lng
  const updateNearestHospital = useCallback(async (lat, lng) => {
    try {
      let hospitalList = [];
      if (!isOffline) {
        const res = await fetch('/api/hospitals');
        const data = await res.json();
        if (data.success && data.hospitals) {
          hospitalList = data.hospitals;
        }
      } else {
        hospitalList = await getAllFromStore('hospitals');
      }

      if (hospitalList && hospitalList.length > 0) {
        let minD = Infinity;
        let closest = null;
        hospitalList.forEach(h => {
          if (h.coordinates?.lat && h.coordinates?.lng) {
            const d = calculateHaversineDistanceKm(lat, lng, h.coordinates.lat, h.coordinates.lng);
            if (d != null && d < minD) {
              minD = d;
              closest = {
                ...h,
                live_distance_km: d,
                live_travel_time_mins: Math.max(5, Math.round(d * 2.2))
              };
            }
          }
        });
        setNearestHospital(closest);
      }
    } catch (e) {
      console.warn('[GPS Nearest Hospital Update Warning]:', e.message);
    }
  }, [isOffline]);

  // 2. Log GPS Telemetry to Backend / PostgreSQL (or IndexedDB when offline)
  const logGpsToBackend = useCallback(async (eventType = 'LOCATION_PING', customMeta = {}) => {
    const payload = {
      id: 'gps-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      accuracy_meters: coordinates.accuracy,
      altitude_meters: coordinates.altitude,
      speed_mps: coordinates.speed,
      heading: coordinates.heading,
      user_id: user?.id || 'usr_citizen',
      user_name: user?.fullName || 'Gramin Citizen / ASHA',
      role: user?.role || 'citizen',
      district: customMeta.district || (RURAL_GPS_PRESETS[activePreset]?.district || 'Nashik Rural'),
      taluka: customMeta.taluka || (RURAL_GPS_PRESETS[activePreset]?.taluka || 'Trimbakeshwar'),
      village: customMeta.village || (RURAL_GPS_PRESETS[activePreset]?.village || 'Trimbak Pada 3'),
      event_type: eventType,
      source: gpsStatus === 'simulated' ? 'SIMULATED_PRESET' : 'BROWSER_GPS',
      created_at: new Date().toISOString()
    };

    try {
      if (!isOffline) {
        const res = await fetch('/api/gps/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success && data.log) {
          setGpsLogs(prev => [data.log, ...prev.slice(0, 49)]);
          setLastLoggedAt(new Date().toLocaleTimeString());
          await saveToStore('gps_logs', data.log);
          return data.log;
        }
      }
    } catch (err) {
      console.log('[GPS Online Log Fallback]:', err.message);
    }

    // Offline IndexedDB Save
    try {
      await saveToStore('gps_logs', payload);
      setGpsLogs(prev => [payload, ...prev.slice(0, 49)]);
      setLastLoggedAt(new Date().toLocaleTimeString() + ' (Offline Cached)');
      return payload;
    } catch (e) {
      console.warn('[GPS Offline Save Error]:', e);
    }
  }, [coordinates, user, isOffline, gpsStatus, activePreset]);

  // 3. Browser Geolocation Trigger
  const refreshGps = useCallback(() => {
    setGpsStatus('acquiring');

    if (!('geolocation' in navigator)) {
      console.warn('[GPS] Geolocation not supported by browser, using Rural Maharashtra fallback');
      applyPreset('trimbak_pada');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 15.0,
          altitude: pos.coords.altitude || null,
          speed: pos.coords.speed || null,
          heading: pos.coords.heading || null,
          timestamp: new Date(pos.timestamp).toISOString()
        };
        setCoordinates(newCoords);
        setGpsStatus('locked');
        updateNearestHospital(newCoords.latitude, newCoords.longitude);
      },
      (err) => {
        console.warn('[GPS Error / Denied]:', err.message);
        setGpsStatus('simulated');
        applyPreset('trimbak_pada');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      }
    );
  }, [updateNearestHospital]);

  // 4. Apply Preset Location
  const applyPreset = (presetKey) => {
    const preset = RURAL_GPS_PRESETS[presetKey];
    if (preset) {
      setActivePreset(presetKey);
      setCoordinates({
        latitude: preset.lat,
        longitude: preset.lng,
        accuracy: 10.0,
        altitude: 600,
        speed: 0,
        heading: 0,
        timestamp: new Date().toISOString()
      });
      setGpsStatus('simulated');
      updateNearestHospital(preset.lat, preset.lng);
    }
  };

  // 5. Fetch initial GPS logs from server & DB
  const loadGpsLogs = async () => {
    try {
      if (!isOffline) {
        const res = await fetch('/api/gps/logs?limit=30');
        const data = await res.json();
        if (data.success && data.logs) {
          setGpsLogs(data.logs);
          return;
        }
      }
    } catch (e) {}

    try {
      const cached = await getAllFromStore('gps_logs');
      if (cached && cached.length > 0) {
        setGpsLogs(cached.reverse().slice(0, 30));
      }
    } catch (e) {}
  };

  // Initial load
  useEffect(() => {
    refreshGps();
    loadGpsLogs();
  }, []);

  // Update nearest hospital when coordinates change
  useEffect(() => {
    updateNearestHospital(coordinates.latitude, coordinates.longitude);
  }, [coordinates.latitude, coordinates.longitude, updateNearestHospital]);

  // Periodic Telemetry Ping (every 60 seconds if tracking is active)
  useEffect(() => {
    if (!isLiveTracking) return;

    const timer = setInterval(() => {
      logGpsToBackend('LOCATION_PING');
    }, 60000);

    return () => clearInterval(timer);
  }, [isLiveTracking, logGpsToBackend]);

  const value = {
    coordinates,
    gpsStatus,
    activePreset,
    nearestHospital,
    gpsLogs,
    isLiveTracking,
    lastLoggedAt,
    refreshGps,
    applyPreset,
    logGpsToBackend,
    setIsLiveTracking,
    loadGpsLogs,
    calculateDistanceTo: (targetLat, targetLng) => calculateHaversineDistanceKm(coordinates.latitude, coordinates.longitude, targetLat, targetLng)
  };

  return <GpsContext.Provider value={value}>{children}</GpsContext.Provider>;
}

export function useGps() {
  const context = useContext(GpsContext);
  if (!context) {
    throw new Error('useGps must be used within a GpsProvider');
  }
  return context;
}
