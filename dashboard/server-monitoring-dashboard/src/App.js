// src/App.js
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ClientDetail from './components/ClientDetail';


import AlertsContainer from './components/AlertsContainer';



function App() {
  const [selectedClient, setSelectedClient] = useState(null);

  return (
    <div>
      <AlertsContainer />
      {selectedClient ? (
        <ClientDetail 
          clientName={selectedClient} 
          onBack={() => setSelectedClient(null)} 
        />
      ) : (
        <Dashboard onClientSelect={setSelectedClient} />
      )}
    </div>
  );
}

export default App;