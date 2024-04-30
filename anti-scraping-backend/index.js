const express = require('express');
const data = require('./MOCK_DATA.json');
var cors = require('cors')
const NodeCache = require("node-cache");
const {RecaptchaEnterpriseServiceClient} = require('@google-cloud/recaptcha-enterprise');
const blacklistCache = new NodeCache();
const captchaListCache = new NodeCache();
const requestIp = require('request-ip')
const app = express();
app.use(cors())
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

require('dotenv').config();


const port = process.env.PORT || 5000;
const BAN_TIME = process.env.BAN_TIME || 60;



// Define your routes here

const userIdentifyVerification = (req, res, next) => {
    var ip = requestIp.getClientIp(req)
    ip = ip.replace('::ffff:', '');
    console.log(`Request IP: ${ip}`);

    var hash = req.headers['fingerprint'] || ''

    console.log(`Request Hash: ${hash}`);

    var banRequest = req.headers['banrequest'] || 'false'

    var captchaToken = req.headers['captcha'] || ''

    console.log(`Captcha token: ${captchaToken}`)

    if(captchaToken != ''){
    if(captchaListCache.get(captchaToken))
    {
        console.log('Captcha already verified')
        next()
        return true;
    }

   const captchaVerified = fetch("https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.CAPTCHA_KEY + "&response=" + captchaToken,
  {method: 'POST'}).then(res => res.json()).then(json => {
      console.log(json)
      if(json.success){
          console.log('Captcha verified')
          captchaListCache.set(captchaToken, true, 120);
          //next()
          return true
      }else{
          console.log('Captcha failed')
          return false
      }
    }).catch(err => {
        console.log(err)
        return false
    });
  }

    if(banRequest === 'true'){
        console.log('Ban request received')
        blacklistCache.set(ip, true, BAN_TIME); // Adds the IP to the blacklist with value true
        if(hash != ''){
            blacklistCache.set(hash, true, BAN_TIME); // Adds the Hash to the blacklist with value true
        }
        res.status(403).send(
            {
                success: false,
                message: 'You were banned, please solve the captcha to continue',
                data: {ban: 'true',  ip_address: ip}
            }
        )
        return;
    }

    if(blacklistCache.get(ip) || blacklistCache.get(hash)){
        console.log('Blacklisted IP or Hash detected')
        res.status(403).send({
            success: false,
            message:  'You are blacklisted temporarily, please solve the captcha to continue',
            data: {ban: 'true', ip_address: ip}
    });
        return;
    }
    next();
};


  app.use(userIdentifyVerification);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the anti-scraping API",
        success: true,
        data: []
    });
});
app.get('/cars', (req, res) => {
    res.json({
        data: data,
        success: true,
        message: "Successfully fetched data"
    });
});

app.get('/cars/:id', (req, res) => {
    const id = req.params.id;
    const car = data.find(car => car.id == id);
    if(car){
        res.json({
            data: car,
            success: true,
            message: "Successfully fetched data"
        });
    }else{
        res.json({
            success: false,
            message: "Car not found",
            data: []
        });
    }
});