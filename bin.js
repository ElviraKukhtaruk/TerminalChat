let tcpClient = require('./client');
let host = process.argv[2];
let port = process.argv[3];

tcpClient(host, port);