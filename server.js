//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var db;

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  } else {
    mongoHost = "mongo";
    mongoPort = "27017";
    mongoDatabase = "sampledb";
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}

// URLs
app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/biometria', function (req, res) {
  var biometria = { codigo: req.query.codigo, nome: req.query.nome, perfil: req.query.perfil, perfil_acesso: req.query.perfil_acesso, apartamento: req.query.apartamento, foto: req.query.foto, observacoes: req.query.observacoes, data_cadastro: req.query.data_cadastro };
  db.collection("biometrias").insert(biometria);
  res.send('{ status: 1 }');
});

app.get('/veiculo', function (req, res) {
  var veiculo = { serial: req.query.serial, marca: req.query.marca, cor: req.query.cor, placa: req.query.placa, foto: req.query.foto, rotulo: req.query.rotulo, data_cadastro: req.query.data_cadastro };
  db.collection("veiculos").insert(veiculo);
  res.send('{ status: 1 }');
});

app.get('/evento', function (req, res) {
  var evento = { tipo: req.query.tipo, id: req.query.id, panico: req.query.panico, data_hora: req.query.data_hora };
  db.collection("eventos").insert(evento);
  res.send('{ status: 1 }');
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

// Initialize connection with MongoDB once
MongoClient.connect(mongoURL, function(err, database) {
  if(err) throw err;

  db = database;
  console.log('Connected to MongoDB at: %s', mongoURL);

  // Start the application after the database connection is ready
  app.listen(port, ip);
  console.log('Server running on http://%s:%s', ip, port);
});

module.exports = app ;
