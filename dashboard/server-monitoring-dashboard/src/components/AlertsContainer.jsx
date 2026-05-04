import React from 'react';
import AlertToast from './AlertToast';
import { useAlerts } from '../hooks/useAlerts';

const AlertsContainer = () => {
  const { alerts, setAlerts } = useAlerts(); // OR useAlerts("clientA")

  const handleDismiss = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AlertToast alerts={alerts} onDismiss={handleDismiss} />
  );
};

export default AlertsContainer;