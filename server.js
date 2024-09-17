#!/usr/bin/env node

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
//For displaying the IP
const os = require('os');
// INITIAL VALUES
var time = 300; // default value of timer
var run = false; // run timer on server start
var text = ""; // initial text
const COMMUNICATION_PORT = 90; // HTTP port
const UPDATE_INTERVAL = 1000; // maximum value is 1000(ms)!!!

// SEND DATA TO CLIENT
function sendData() {
    io.emit("time", time);
    let date_ob = new Date();
    let current_time = date_ob.toLocaleString('hu-HU', {
        timeZone: 'Europe/Budapest'
    }).split(' ')[3];
    io.emit("current_time", current_time);
    io.emit("status", run);
    io.emit("updateText", text);
}

// TIMER
function timer() {
    if (run && time > 0) {
        time = time - 1;
    }
    sendData();
}

// HTTP request
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/timer.html');
});

app.get('/timer', (req, res) => {
    res.sendFile(__dirname + '/timer.html');
});

app.get('/text', (req, res) => {
    res.sendFile(__dirname + '/text.html');
});
app.get('/mobil', (req, res) => {
    res.sendFile(__dirname + '/mobil.html');
});

app.get('/control', (req, res) => {
    res.sendFile(__dirname + '/controller.html');
});
app.get('/logo1.png', (req, res) => {
    res.sendFile(__dirname + '/logo1.png');
});

app.get('/logo2.png', (req, res) => {
    res.sendFile(__dirname + '/logo2.png');
});
// SOCKET.IO
io.on('connection', (socket) => {
    console.log('a user connected');
    var clientIp = socket.request.connection.remoteAddress;
    console.log('New connection from ' + clientIp);
    // on connection send data to client
    sendData();
    // disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    // start
    socket.on('start', () => {
        run = true;
        sendData();
    });
    // stop
    socket.on('stop', () => {
        run = false;
        sendData();
    });
    // set
    socket.on('set', (data) => {
        time = data;
        console.warn(data);
        sendData();
    });
    // updateText
    socket.on('updateText', (data) => {
        text = data;
        sendData();
    });
});

// START SERVER
// START SERVER
server.listen(COMMUNICATION_PORT, '0.0.0.0', function () {
    const networkInterfaces = os.networkInterfaces();
    const ipAddresses = [];

    Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((iface) => {
            if (iface.family === 'IPv4' && !iface.internal) {
                ipAddresses.push(iface.address);
            }
        });
    });

    console.log('Server listening on ' + ipAddresses.join(', ') + ':' + COMMUNICATION_PORT);
    console.log('Open http://'+ ipAddresses.join(', ') + ':' + COMMUNICATION_PORT + '/' + ' for the timer')
    /*
    console.log('Open http://'+ ipAddresses.join(', ') + ':' + COMMUNICATION_PORT + '/control' + ' for the controller')
    console.log('Open http://'+ ipAddresses.join(', ') + ':' + COMMUNICATION_PORT + '/text' + ' for the text display controller')
     */
    console.log('Open http://'+ ipAddresses.join(', ') + ':' + COMMUNICATION_PORT + '/mobil' + ' for mobil controller')
});

// TIMER INTERVAL
setInterval(timer, UPDATE_INTERVAL < 1000 ? 1000 : UPDATE_INTERVAL);
