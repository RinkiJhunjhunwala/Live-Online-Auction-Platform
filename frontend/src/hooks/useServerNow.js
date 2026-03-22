import { useState, useEffect } from 'react';
import { fetchJson } from '../lib/http.js';

export function useServerNow() {
  // Fallback initially to client clock until synced
  const [serverNow, setServerNow] = useState(Date.now());
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let offset = 0;
    
    const syncTime = async () => {
      try {
        const start = performance.now();
        const { serverTime } = await fetchJson('/health');
        const end = performance.now();
        
        // Estimate the network delay (round trip time / 2)
        const rtt = end - start;
        const estimatedServerTime = serverTime + (rtt / 2);
        
        // Offset is the difference between estimated server timestamp and performance timer
        offset = estimatedServerTime - performance.now();
        setSynced(true);
      } catch (err) {
        console.error('Failed to sync server time:', err);
      }
    };

    syncTime();

    const interval = setInterval(() => {
      // If we are somewhat synced, we compute time based on the performance clock + offset.
      // If not, we just use Date.now() as a fallback.
      if (offset !== 0) {
        setServerNow(performance.now() + offset);
      } else {
        setServerNow(Date.now());
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return { serverNow, synced };
}
