const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');

// Configuração do Socket.IO
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});
const socketIoPort = 3000;

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('send_message', (data) => {
        const sentTime = new Date().getTime();
        data.timestamp = sentTime; // Adiciona timestamp à mensagem
        console.log('Message received from web client:', data);
        // Publicar a mensagem recebida via MQTT
        mqttClient.publish('chat/messages', JSON.stringify(data), (err) => {
            if (err) {
                console.error('Error publishing message:', err);
            } else {
                console.log('Message published to MQTT');
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(socketIoPort, () => {
    console.log(`Socket.IO server running on port ${socketIoPort}`);
});

// Configuração do cliente MQTT
const mqttClient = mqtt.connect('mqtt://localhost:1884');

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('chat/messages', (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log('Subscribed to chat/messages');
        }
    });
    mqttClient.subscribe('iot/to/web', (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log('Subscribed to iot/to/web');
        }
    });
});

mqttClient.on('message', (topic, message) => {
    if (topic === 'chat/messages') {
        const data = JSON.parse(message.toString());
        console.log('Message received from MQTT:', data);
        // Enviar a mensagem recebida para todos os clientes conectados via Socket.IO
        io.emit('receive_message', data);
    } else if (topic === 'iot/to/web') {
        console.log('Message received from IoT:', message.toString());
        // Enviar a mensagem recebida para todos os clientes conectados via Socket.IO
        io.emit('receive_message', { user: 'IoT Device', message: message.toString() });
    }
});
