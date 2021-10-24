# TerminalChat - Client

## 1. Generating the ed25519 key pair with OpenSSL:
Private key:
```
openssl genpkey -algorithm ed25519 -out my_private_ed25519_key.pem
```
Public key:
```
openssl pkey -in my_private_ed25519_key.pem -pubout -out my_public_ed25519_key.pem
```

## 2. Connection with node:

```
node bin.js host port path_to_your_private_ed25519_key path_to_server_public_ed25519_key
```

Example:

```
node bin.js 127.0.0.1 3000 ./my_private_ed25519_key.pem ./server_public_ed25519_key.pem
```
