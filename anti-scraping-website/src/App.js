import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'; 
import rootReducer  from './reducers'; 
import modifyDataMiddleware from './middleware'; 
import fp from "fingerprintjs2";
import { load } from '@fingerprintjs/botd'


import MockCars from './MockCars';
import React, { useState, useEffect } from 'react';


export const getFingerprint = () =>
  new Promise(resolve => {
    if(process.env.REACT_APP_APPLY_FINGERPRINTING === 'true')
    {
      fp.get(components => {
        var values = components.map(function (component) { return component.value })
        var murmur = fp.x64hash128(values.join(''), 31)
        localStorage.setItem('fingerprint_hash', murmur);
        resolve(components);
      });
    }
  });

function App() {
  console.log('Apply markup randomization: ' + process.env.REACT_APP_APPLY_MARKUP_RANDOMIZATION);
  console.log('Apply fingerprinting: ' + process.env.REACT_APP_APPLY_FINGERPRINTING);
  const carJson = require('./MOCK_DATA.json');
  const [cars, setCars] = useState([]);
  const [fingerprint, setFingerprint] = useState();
  const [isBot, setIsBot] = useState();
  const [identityChecked, setIdentityChecked] = useState(false);
  const [isLying, setIsLying] = useState(false);


  if(fingerprint && !identityChecked && process.env.REACT_APP_APPLY_MARKUP_RANDOMIZATION === 'true')
  {
    // Get fingerprint then check if user is lying about browser
    getFingerprint()
    .then(fp => {
      setFingerprint(fp);  // Update the state

      localStorage.setItem('fingerprint', JSON.stringify(fp)); // Save the fingerprint in local storage
      let liedOs, liedBrowser, liedResolution, liedLanguages = false

      fp.forEach(obj => {
        if (obj.key === 'hasLiedOs') {
          liedOs = obj.value;
            console.log('Has Lied OS: ' + liedOs);
        }
        if(obj.key === 'hasLiedBrowser'){
            liedBrowser = obj.value;
            console.log('Has Lied Browser: ' + liedBrowser);
        }
        if(obj.key === 'hasLiedResolution'){
            liedResolution = obj.value;
            console.log('Has Lied Resolution: ' + liedResolution);
        }
        if(obj.key === 'hasLiedLanguages'){
          liedLanguages = obj.value;
            console.log('Has Lied Languages: ' + liedLanguages);
        }
        if(liedOs || liedBrowser || liedResolution || liedLanguages){
          setIsLying(true);
          console.log('User is lying identity')
          localStorage.setItem('isLying', true);
        }
    });
    });
    
  // Initialize an agent at application startup, once per page/app.
  const botdPromise = load()
  // Get detection results when you need them.
  botdPromise
      .then((botd) => botd.detect())
      .then((result) => {
        console.log('Is bot: ' + result.bot);
        localStorage.setItem('isBot', result.bot);
        setIsBot(result.bot);
      })
      .catch((error) => console.error(error));

  setIdentityChecked(true);
  }


  const store = createStore(
    rootReducer,
    applyMiddleware(modifyDataMiddleware)
  );

  useEffect(() => {
    setCars(carJson);
    setFingerprint(process.env.REACT_APP_APPLY_FINGERPRINTING || false);

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
