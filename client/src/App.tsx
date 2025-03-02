import React from 'react';
import './css/App.css';
import Home from './Home';
import { MainProvider } from './UseContext/MainContext';

function App() {
  return (
      <MainProvider>
      <Home />
    </MainProvider>
  );
}

export default App;
