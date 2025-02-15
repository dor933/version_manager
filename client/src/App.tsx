import React from 'react';
import './css/App.css';
import Home from './Home';
import { AuthProvider } from './UseContext/MainAuth';
import Popup from './Help_Components/Popup';
function App() {
  return (
    <AuthProvider>
      <Home />
      <Popup />
    </AuthProvider>
  );
}

export default App;
