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

process.on('SIGINT', () => {
  wss.clients.forEach((client) => {
    client.close();
  });
  server.close(() => {
    shutdownDB();
  });
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

  db.run(`INSERT INTO visitors (count, time)
    VALUES (${numClient}, datetime('now'))
  `);

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

// end websocket server

// Begin database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `)
});

function getCounts() {
  db.each('SELECT * FROM visitors', (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log('Shutting down database connection');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
  });
}