# TerminalChat 

## 1. Generate the key pair
For the server:
```
openssl genpkey -algorithm x25519 -out x25519-priv.pem
```
For clients:
```
openssl pkey -in x25519-priv.pem -pubout -out x25519-pub.pem
```
### Path to the server's private key:
TerminalChat/server/keys/x25519-priv.pem

## 2. Connect with node:

```
node TerminalChat/client/start.js host port path_to_public_server_key
```

Example:

```
node TerminalChat/client/start.js 127.0.0.1 3000 TerminalChat/server/keys/x25519-pub.pem
```

You also need to configure [PostgreSQL](https://www.postgresql.org/) and [Redis](https://redis.io/) for the server.
