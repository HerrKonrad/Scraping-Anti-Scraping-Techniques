import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'; 
import rootReducer  from './reducers'; 
import modifyDataMiddleware from './middleware'; 

import MockCars from './MockCars';
import React, { useState, useEffect } from 'react';

function App() {
  console.log('Apply markup randomization: ' + process.env.REACT_APP_APPLY_MARKUP_RANDOMIZATION);
  const carJson = require('./MOCK_DATA.json');
  const [cars, setCars] = useState([]);
  const store = createStore(
    rootReducer,
    applyMiddleware(modifyDataMiddleware)
  );

  useEffect(() => {
    setCars(carJson);
  }, [carJson, cars]);

  return (
    <div className="App">
      <h1>Cars for Sale</h1>
      <Provider store={store}>
      <MockCars cars={cars} />
      </Provider>

      
      
    </div>
  );
}

export default App;
