// src/context/SavedPinsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'savedPins';
const SavedPinsContext = createContext();

/** Provides `pins`, `save(pin)`, and `remove(pin)` to all children */
export function SavedPinsProvider({ children }) {
  const [pins, setPins] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // Mirror localStorage whenever `pins` changes
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
  }, [pins]);

  const save = pin => setPins(prev => {
    if (prev.some(p => p.id === pin.id)) return prev;
    return [...prev, pin];
  });

  const remove = pin => setPins(prev => prev.filter(p => p.id !== pin.id));

  return (
    <SavedPinsContext.Provider value={{ pins, save, remove }}>
      {children}
    </SavedPinsContext.Provider>
  );
}

export function useSavedPins() {
  const ctx = useContext(SavedPinsContext);
  if (!ctx) throw new Error('useSavedPins must be inside SavedPinsProvider');
  return ctx;
}
