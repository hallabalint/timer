#!/usr/bin/env node

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//INITIAL VALUES
var time = 300; //default value of timer
var run = false; //run timer on server start
const COMMUNICATION_PORT = 3000; //HTTP port
const UPDATE_INTERVAL = 1000; //maximum value is 1000(ms)!!!

//SEND DATA TO CLIENT
function sendData() {
    io.emit("time", time);
    let date_ob = new Date();
    let current_time = date_ob.toLocaleString('en-US', {
        timeZone: 'Europe/Budapest'
    }).slice(11, 19);
    io.emit("current_time", current_time);
    io.emit("status", run);
}

//timer
function timer() {
    if (run && time > 0) {
        time = time - 1;
    }
    sendData();
}

//HTTP request
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/timer.html');
});

app.get('/logo1.png', (req, res) => {
    res.sendFile(__dirname + '/logo1.png');
});

app.get('/logo2.png', (req, res) => {
    res.sendFile(__dirname + '/logo2.png');
});

app.get('/control', (req, res) => {
    res.sendFile(__dirname + '/controller.html');
});

//SOCKET.IO
io.on('connection', (socket) => {
    console.log('a user connected');
    var clientIp = socket.request.connection.remoteAddress;
    console.log('New connection from ' + clientIp);
    //on connection send data to client
    sendData();
    //disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    //start
    socket.on('start', () => {
        run = true;
        sendData();
    });
    //stop
    socket.on('stop', () => {
        run = false;
        sendData();
    });
    //set
    socket.on('set', (data) => {
        time = data;
        console.warn(data);
        sendData();
    });
});

//START SERVER
server.listen(COMMUNICATION_PORT, () => {
    console.log('listening on *:' + COMMUNICATION_PORT);
});

//TIMER INTERVAL
setInterval(timer, UPDATE_INTERVAL < 1000 ? 1000 : UPDATE_INTERVAL);