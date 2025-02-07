const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, () => {
  console.log('Server started on port 3000');
});

// Begin WebSocket server
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const numClient = wss.clients.size;
  console.log(`Client connected. Total clients: ${numClient}`);

  wss.broadcast('Current visitors: ' + numClient);

  if (ws.readyState === ws.OPEN) {
    ws.send('Welcome to my server!');
  }

  ws.on('close', () => {
    wss.broadcast(`Current visitors: ${numClient}`);
    console.log('A client has disconnected');
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach((client) => {
    client.send(data);
  });
};