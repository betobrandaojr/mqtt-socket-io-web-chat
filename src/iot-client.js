const mqtt = require('mqtt');
const readline = require('readline');

const client = mqtt.connect('mqtt://localhost:1884');

client.on('connect', () => {
    console.log('IoT Client connected to broker');
    client.subscribe('chat/messages', (err) => {
        if (!err) {
            console.log('IoT Client subscribed to chat/messages');
        } else {
            console.error('Subscription error:', err);
        }
    });
    client.subscribe('web/to/iot', (err) => {
        if (!err) {
            console.log('IoT Client subscribed to web/to/iot');
        } else {
            console.error('Subscription error:', err);
        }
    });

    // Permitir entrada de usuário para enviar mensagens
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', (input) => {
        const message = input.trim();
        client.publish('iot/to/web', message);
        console.log(`Sent message: ${message}`);
    });
});

client.on('message', (topic, message) => {
    if (topic === 'chat/messages') {
        const receivedTime = new Date().getTime();
        const messageObject = JSON.parse(message.toString());
        const sentTime = messageObject.timestamp;
        const latency = receivedTime - sentTime;
        console.log(`IoT Client received message: ${messageObject.message} on topic: ${topic}`);
        console.log(`Message latency: ${latency} ms`);
    } else if (topic === 'web/to/iot') {
        console.log(`IoT Client received message from web: ${message.toString()}`);
    } else {
        console.log(`Message received on different topic: ${topic}`);
    }
});

client.on('error', (err) => {
    console.error('MQTT Client Error:', err);
});

client.on('offline', () => {
    console.log('MQTT Client is offline');
});

client.on('reconnect', () => {
    console.log('MQTT Client is reconnecting');
});
