
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn(function (key) {
      return store[key] || null;
    }),
    setItem: jest.fn(function (key, value) {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(function (key) {
      delete store[key];
    }),
    clear: jest.fn(function () {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});


if (typeof window.google === 'undefined') {
  window.google = {
    maps: {
      places: {
        Autocomplete: jest.fn(function () {
          this.addListener = jest.fn((event, callback) => {

            if (event === 'place_changed') {
              this.mockPlaceChanged = callback; 
            }
          });
          this.triggerPlaceChanged = (place) => {
            if (this.mockPlaceChanged) {
              this.mockPlaceChanged(place);
            }
          };
        }),
      },

      LatLng: jest.fn(function (lat, lng) {
        this.lat = () => lat;
        this.lng = () => lng;
      }),
    },
  };
}

if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
