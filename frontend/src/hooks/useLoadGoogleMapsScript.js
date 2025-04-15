import { useState, useEffect } from 'react';

const useLoadGoogleMapsScript = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.google) {
      setIsLoaded(true); // Dacă Google Maps a fost deja încărcat
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError("Error loading Google Maps API");

    document.head.appendChild(script);
  }, [apiKey]);

  return { isLoaded, error };
};

export default useLoadGoogleMapsScript;
