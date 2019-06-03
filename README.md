## Overview

This is a web-based simple access control application. Designed to show last access for biometrical devices (virdi) ou radio frequency devices (linear).

Exposing REST API, is possible to let the clients call when a new record is inserted (person or vehicle) or a event happens.

## Dependencies

Run using MongoDB, is necessary to setup an Mongo DB Server ou start everything whit docker-compose.

The out-of-box server.js use a host called "mongo" to connect to MongoDB server. So, if you are using the default connections properties, you must include de host "mongo" on your environment (linux = /etc/host , windows = c:\Windows\system32\drivers\etc\hosts)

## hot deploy

´´´
$ npm install nodemon -g
$ nodemon app.js
´´´

## The REST Api

The URLs are so simples that I can´t even call it an API. You must send the data with a GET request, and with params on the URL string. Follow the examples:

### biometria

curl -d "codigo=000123&nome=Nome&perfil=001&perfil_acesso=001&apartamento=271&data_cadastro=2019-04-25T05:46:00&data_envio=2019-04-25T05:46:10" -X POST http://localhost:8080/biometrias/salvar

### veiculo

curl -d "serial=ABCDEFG&marca=HONDA&cor=PRATA&placa=EJQ2449&apartamento=271&rotulo=TESTEROTULO&data_cadastro=2019-04-25T05:46:20&data_envio=2019-04-25T05:46:30" -X POST http://localhost:8080/veiculos/salvar

### evento biometria
curl -d "tipo=B&codigo=000123&local=001&panico=N&bateria_fraca=N&data_hora=2019-04-25T05:47:00" -X POST http://localhost:8080/eventos/salvar

### evento veiculo
curl -d "tipo=L&serial=ABCDEFH&local=001&panico=N&bateria_fraca=N&data_hora=2019-04-26T05:49:01" -X POST http://localhost:8080/eventos/salvar

### evento veiculo - bateria fraca
curl -d "tipo=L&serial=ABCDEFH&local=001&panico=N&bateria_fraca=S&data_hora=2019-04-26T05:49:03&condominio=1" -X POST http://localhost:8080/eventos/salvar
