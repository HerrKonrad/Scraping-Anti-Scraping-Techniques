const express = require('express');
const data = require('./MOCK_DATA.json');
var cors = require('cors')
const NodeCache = require("node-cache");
const blacklistCache = new NodeCache();
const app = express();
app.use(cors())

const port = process.env.PORT || 5000;
const BAN_TIME = process.env.BAN_TIME || 60;



// Define your routes here

const userIdentifyVerification = (req, res, next) => {
    var ip = req.ip 
            || req.connection.remoteAddress 
            || req.socket.remoteAddress 
            || req.connection.socket.remoteAddress;
            ip = ip.replace('::ffff:', '');
    console.log(`Request IP: ${ip}`);

    var hash = req.headers['fingerprint'] || ''

    console.log(`Request Hash: ${hash}`);

    var banRequest = req.headers['banrequest'] || 'false'

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
                data: []
            }
            
        )
        return;
    }

   

    if(blacklistCache.get(ip) || blacklistCache.get(hash)){
        console.log('Blacklisted IP or Hash detected')
        res.status(403).send({
            success: false,
            message:  'You are blacklisted temporarily, please solve the captcha to continue',
            data: []
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