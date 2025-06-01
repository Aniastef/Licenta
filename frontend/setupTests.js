// frontend/setupTests.js

// Mock localStorage (cod existent)
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(function(key) { // Face getItem un mock function
      return store[key] || null;
    }),
    setItem: jest.fn(function(key, value) { // Face setItem un mock function
      store[key] = value.toString();
    }),
    removeItem: jest.fn(function(key) { // Face removeItem un mock function
      delete store[key];
    }),
        clear: jest.fn(function() { // Face clear un mock function
      store = {};
    })
  };
})();

// Definește proprietatea localStorage cu getter/setter
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// NOU: Mock-uirea globală pentru Google Maps API
// Aceasta este crucială pentru a rezolva "Cannot read properties of undefined (reading 'maps')"
if (typeof window.google === 'undefined') { // Verifică dacă nu a fost deja definit
  window.google = {
    maps: {
      places: {
        Autocomplete: jest.fn(function() {
          // Mock pentru constructorul Autocomplete
          this.addListener = jest.fn((event, callback) => {
            // Putem adăuga o implementare mock pentru place_changed
            // care va apela callback-ul cu un loc mock
            if (event === 'place_changed') {
              this.mockPlaceChanged = callback; // Salvează callback-ul
            }
          });
          // O metodă helper pentru a declanșa manual place_changed în test
          this.triggerPlaceChanged = (place) => {
            if (this.mockPlaceChanged) {
              this.mockPlaceChanged(place);
            }
          };
        }),
      },
      // Poți adăuga alte obiecte/clase/metode din maps dacă sunt folosite (ex: LatLng, Map, Marker etc.)
      // Asigură-te că `LatLng` este definit dacă este folosit de `getLatLng` real.
      LatLng: jest.fn(function(lat, lng) {
          this.lat = () => lat;
          this.lng = () => lng;
      }),
    },
  };
}


// Polyfill for TextEncoder/TextDecoder if needed
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}