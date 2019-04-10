## Overview

This is a web-based simple access control application. Designed to show last access for biometrical devices (virdi) ou radio frequency devices (linear).

Exposing REST API, is possible to let the clients call when a new record is inserted (person or vehicle) or a event happens.

## Dependencies

Run using MongoDB, is necessary to setup an Mongo DB Server ou start everything whit docker-compose.

The out-of-box server.js use a host called "mongo" to connect to MongoDB server. So, if you are using the default connections properties, you must include de host "mongo" on your environment (linux = /etc/host , windows = c:\Windows\system32\drivers\etc\hosts)

## The REST Api

The URLs are so simples that I can´t even call it an API. You must send the data with a GET request, and with params on the URL string. Follow the examples:

/biometria?codigo=000123&nome=Hildebrando Furlan Neto&perfil=Morador&perfil_acesso=001&apartamento=271&foto=hex&observacoes=&data_cadastro=2018-01-01 00:00:00

/veiculo?serial=206A2B9&marca=Hyundai&cor=cinza&placa=ABC1234&foto=hex&rotulo=Hildebrando Furlan Neto&data_cadastro=2018-01-01 00:00:00

/evento?tipo=B&id=000123&panico=N
