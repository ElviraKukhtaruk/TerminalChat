# TerminalChat 

## Generate the key pair

```
openssl genpkey -algorithm x25519 -out x25519-priv.pem
```
```
openssl pkey -in x25519-priv.pem -pubout -out x25519-pub.pem
```
 /client/keys/x25519-pub.pem <br/>
 /server/keys/x25519-priv.pem



## Connect with node:

```
node bin.js host port
```

Example:

```
node ./bin.js 127.0.0.1 3000
```
