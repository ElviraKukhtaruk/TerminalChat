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
## 2. Create a file where the user's token will be stored
 
### Path to the user's token
/client/token/token

## 3. Connect with node:

```
node bin.js host port path_to_server_public_key
```

Example:

```
node ./bin.js 127.0.0.1 3000 ../server/keys/x25519-pub.pem
```
