import React from 'react';
import './App.css';
import Home from './Home';
import { AuthProvider } from './UseContext/MainAuth';

function App() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}

export default App;
