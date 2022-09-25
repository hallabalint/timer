#!/usr/bin / env node

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var time = 300;
var run = false;

function sendData() {
    io.emit("time", time);
    let date_ob = new Date();
    let current_time = date_ob.toLocaleString('en-US', {
        timeZone: 'Europe/Budapest'
    }).slice(11, 19);
    io.emit("current_time", current_time);
    io.emit("status", run);
}

function timer() {
    if (run && time > 0) {
        time = time - 1;
    }
    sendData();
}
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

io.on('connection', (socket) => {
    console.log('a user connected');
    //ha csatalkozik időt küldünk
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

server.listen(3000, () => {
    console.log('listening on *:3000');
});

setInterval(timer, 1000);