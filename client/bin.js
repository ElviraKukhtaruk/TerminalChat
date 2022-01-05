let net             = require('net');
let tcpClient       = require('./client');
let host            = process.argv[2];
let port            = process.argv[3];
let serverPublicKey = process.argv[4];

let client = new net.Socket();
    client.connect(port, host, tcpClient.bind({
        	client: client, 
        	host: host, 
        	port: port,
        	serverPublicKey: serverPublicKey
    }));

console.log(`
Host: ${host}, 
Port: ${port}, 
Server public ed25519 key: ${serverPublicKey}
`);
