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
### Path to private server key
/server/keys/x25519-priv.pem

## 2. Connect with node:

```
node bin.js host port path_to_public_server_key
```

Example:

```
node ./bin.js 127.0.0.1 3000 ../server/keys/x25519-pub.pem
```

You also need to configure [Mongodb](https://www.mongodb.com/) and [Redis](https://redis.io/) for the server.
