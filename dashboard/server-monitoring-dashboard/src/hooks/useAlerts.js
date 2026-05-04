import { useEffect, useState, useRef } from 'react';
import { fetchAlerts } from '../services/api';

export const useAlerts = (clientName) => {
  const [alerts, setAlerts] = useState([]);
  const seenIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts(clientName);

        const newAlerts = [];

        data.forEach((a) => {
          // 👇 On FIRST load → just mark as seen, DO NOT show
          if (isFirstLoadRef.current) {
            seenIdsRef.current.add(a.id);
            return;
          }

          if (!seenIdsRef.current.has(a.id)) {
            seenIdsRef.current.add(a.id);

            newAlerts.push({
              id: a.id,
              message: `(${a.priority}) ${a.alertType} - ${a.description || 'No details'}`,
              priority: a.priority,
            });
          }
        });

        // 👇 Only add new alerts after first load
        if (!isFirstLoadRef.current && newAlerts.length > 0) {
          setAlerts((prev) => [...newAlerts, ...prev]);
        }

        isFirstLoadRef.current = false;

      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };

    loadAlerts();

    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, [clientName]);

  return { alerts, setAlerts };
};