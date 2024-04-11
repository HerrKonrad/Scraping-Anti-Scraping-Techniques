import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import MockCars from './MockCars';
import React, { useState, useEffect } from 'react';
function App() {
  const carJson = require('./MOCK_DATA.json');
  const [cars, setCars] = useState([]);
  

  useEffect(() => {
    setCars(carJson);
  }, [carJson, cars]);

  return (
    <div className="App">
      <h1>Cars for Sale</h1>
      <MockCars cars={cars} />
    </div>
  );
}

export default App;
