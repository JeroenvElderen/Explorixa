// src/context/SavedPinsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEYS = {
  favorites: 'savedPins',
  beenThere: 'beenTherePins',
  wantToGo: 'wantToGoPins'
};

const SavedPinsContext = createContext();

export function SavedPinsProvider({ children }) {
  // Initialize all three lists from localStorage
  const [pins, setPins] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites)) || []; }
    catch { return []; }
  });
  const [beenTherePins, setBeenTherePins] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.beenThere)) || []; }
    catch { return []; }
  });
  const [wantToGoPins, setWantToGoPins] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.wantToGo)) || []; }
    catch { return []; }
  });

  // Always scrub out anything without an .id
  useEffect(() => {
    setPins(current => current.filter(p => p && p.id != null));
    setBeenTherePins(current => current.filter(p => p && p.id != null));
    setWantToGoPins(current => current.filter(p => p && p.id != null));
  }, []);

  // Mirror localStorage whenever lists change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(pins));
  }, [pins]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.beenThere, JSON.stringify(beenTherePins));
  }, [beenTherePins]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.wantToGo, JSON.stringify(wantToGoPins));
  }, [wantToGoPins]);

  // Shared helpers for add/remove
  const addPin = (arrSetter, pin) =>
    arrSetter(prev =>
      prev.some(p => p?.id?.toString() === pin.id?.toString()) ? prev : [...prev, pin]
    );
  const removePin = (arrSetter, pin) =>
    arrSetter(prev => prev.filter(p => p?.id?.toString() !== pin.id?.toString()));

  // Context value: expose all three lists and helpers
  const contextValue = {
    pins, // favorites
    beenTherePins,
    wantToGoPins,
    save: pin => addPin(setPins, pin),
    remove: pin => removePin(setPins, pin),
    saveBeenThere: pin => addPin(setBeenTherePins, pin),
    removeBeenThere: pin => removePin(setBeenTherePins, pin),
    saveWantToGo: pin => addPin(setWantToGoPins, pin),
    removeWantToGo: pin => removePin(setWantToGoPins, pin)
  };

  return (
    <SavedPinsContext.Provider value={contextValue}>
      {children}
    </SavedPinsContext.Provider>
  );
}

export function useSavedPins() {
  const ctx = useContext(SavedPinsContext);
  if (!ctx) throw new Error('useSavedPins must be inside SavedPinsProvider');
  return ctx;
}
