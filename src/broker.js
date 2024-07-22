const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
const ws = require('ws');

const mqttPort = 1884;

const wsPort = 8888;

server.listen(mqttPort, () => {
    console.log(`MQTT broker is running on port ${mqttPort}`);
});

const wsServer = new ws.Server({ port: wsPort });
wsServer.on('connection', (socket) => {
    const stream = aedes.handle(socket);
    socket.on('close', () => stream.destroy());
});

console.log(`WebSocket broker is running on port ${wsPort}`);

aedes.on('client', (client) => {
    console.log(`Client connected: ${client.id}`);
});

aedes.on('clientDisconnect', (client) => {
    console.log(`Client disconnected: ${client.id}`);
});

aedes.on('publish', (packet, client) => {
    if (client) {
        console.log(`Message from client ${client.id}: ${packet.payload.toString()}`);
    }
});

aedes.on('subscribe', (subscriptions, client) => {
    console.log(`Client ${client.id} subscribed to: ${subscriptions.map(s => s.topic).join(', ')}`);
});

aedes.on('unsubscribe', (subscriptions, client) => {
    console.log(`Client ${client.id} unsubscribed from: ${subscriptions.join(', ')}`);
});
