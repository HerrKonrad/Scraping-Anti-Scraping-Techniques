import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'; 
import rootReducer  from './reducers'; 
import modifyDataMiddleware from './middleware'; 
import fp, { get } from "fingerprintjs2";
import { load } from '@fingerprintjs/botd'
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HoneypotPage  from './honeypot';

import {MockCars, CarPage }from './MockCars';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'




function App() {

  const [cars, setCars] = useState([]);
  const [fingerprint, setFingerprint] = useState();
  const [isBot, setIsBot] = useState();
  const [identityChecked, setIdentityChecked] = useState(false);
  const [isLying, setIsLying] = useState(false);
  const [filledHoneypot, setFilledHoneypot] = useState(false);
  const [ip, setIP] = useState("");
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


const [fingerprintHash, setFingerprintHash] = useState('');

const getFingerprint = () =>
new Promise(resolve => {
  if(process.env.REACT_APP_APPLY_FINGERPRINTING === 'true')
  {
    fp.get(components => {
      var values = components.map(function (component) { return component.value })
      var murmur = fp.x64hash128(values.join(''), 31)
      localStorage.setItem('fingerprint_hash', murmur);
      setFingerprintHash(murmur);
      resolve(components);
    });
  }
});


  const getIpAddress = async () => {
    if(process.env.REACT_APP_APPLY_FINGERPRINTING === 'true')
    { const res = await axios.get("https://api.ipify.org/?format=json");
    if(res.data.ip !== null || res.data.ip !== undefined || res.data.ip !== '')
    setIP(res.data.ip);
    localStorage.setItem('ip', res.data.ip);
    }
  };

  function onChange(value) {
    console.log("Captcha value:", value);
    let captcha = value
    if(captcha === null || captcha === undefined || captcha === ''){
      console.log('Captcha client submit was unsuccessful')
      return;
    }
    else
    {
      console.log('Captcha client submit was successful')
      localStorage.setItem('captcha', value);
      setCaptchaSolved(true);
      // Reload page
      window.location.reload();

    }

  }

  if(fingerprint && !identityChecked && process.env.REACT_APP_APPLY_FINGERPRINTING === 'true')
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
          // If User is lying or is a bot, we should send to our server the user hash and IP
          // to blacklist them temporarily, obligating the IP or Hash to solve a captcha
          /*
          axios.get('http://localhost:5000/', {
            headers: {
              'fingerprint': localStorage.getItem('fingerprint_hash') || '',
              'banrequest': 'true'
            }
          }).catch
          (err => {
            console.log(err);
          });
          */
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
    const honeypot = (localStorage.getItem('honeypot_filled') === 'true') || false;
    setFilledHoneypot(honeypot);
    console.log('Honeypot filled: ' + honeypot);

  
    let ban_request = (isBot || isLying || filledHoneypot) ? 'true' : 'false';
    
    const captchaToken = localStorage.getItem('captcha') || '';
    axios.get(API_URL + '/cars', {
      headers: {
        'fingerprint': fingerprintHash || '',
        'banrequest': ban_request,
        'captcha': captchaToken || '',
        'x-forwarded-for': ip || ''
    }
    })
    .then(res => {
      
      if(res.data.success === true)
      {
        setCars(res.data.data);
        setIsLoading(false);
      }

      else
      console.log('Failed to fetch data: ' + res.data.message);
    }).catch(err => {
      if(err.response.data.success === false)
      {
        if(err.response.data.data.ban === 'true')
        {
          setCaptchaRequired(true)
          console.log('Captcha required')
          setIsLoading(false);
        }
      }
      console.log(err);
    })
    setFingerprint(process.env.REACT_APP_APPLY_FINGERPRINTING || false);
    getIpAddress();
  }, [isBot, isLying, filledHoneypot, captchaSolved, fingerprintHash, ip]);

 
  return (
    <div className="App">
    <BrowserRouter>
      <Routes>
        <Route path="/fake-page-1" element={<HoneypotPage />} />
        <Route path="/fake-page-2" element={<div>Ops... You're a bot!!!</div>} />
        <Route path="/fake-page-3" element={<div>Ops... You're a bot!!</div>} />
        <Route path="/:carId" element={<CarPage cars={cars} />} />
        <Route path="/" element={<HomePage 
          isBot={isBot}
          isLying={isLying}
          filledHoneypot={filledHoneypot}
          onChange={onChange}
          store={store}
          cars={cars}
          captchaRequired={captchaRequired}
          isLoading={isLoading}
          ip={ip}
          hash={fingerprintHash}
        />} />
        
       </Routes> 
      </BrowserRouter>
    </div>
  );
}

const HomePage = ({ onChange, store, cars, captchaRequired, isLoading, ip, hash }) => {
  return (
    <div>
      <div>
        <h1>Cars for Sale</h1>
        {isLoading ? (
          <div className="spinner-border" role="status"></div>
        ) : (
          process.env.REACT_APP_APPLY_CAPTCHA === 'true' && captchaRequired ? (
            <div>
              <span>A suspicious behavior was detected. Complete the CAPTCHA to access the page</span>
              <br></br>
              <span>Your IP Address: {ip} </span>
              <br></br>
              <span>Your Canvas Fingerprint Hash: {hash}</span>
            <ReCAPTCHA sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} onChange={onChange} />
            </div>
          ) : (
            <Provider store={store}>
              <MockCars cars={cars} />
            </Provider>
          )
        )}
      </div>
     
    </div>
  );
};




export default App;
