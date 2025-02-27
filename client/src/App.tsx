import React from 'react';
import './css/App.css';
import Home from './Home';
import { AuthProvider } from './UseContext/MainContext';

function App() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}

export default App;
