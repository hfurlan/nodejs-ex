//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(morgan('combined'))
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//var http = require('http').Server(app);
//var io = require('socket.io')(http);

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

// Conexao com MongoDB
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongoose.connect(mongoURL);
  db = mongoose.connection;

//  Trigger - Avisar todos os clientes que estiverem ouvindo tambem via websocket
//  db.collection('eventos').watch().on('change', evento =>
//    var cursor = db.collection("socket_ids").find({})
//    while(cursor.hasNext()){
//      socketId = cursor.next();
//      console.log('enviando para ' + socketId);
//      io.sockets.socket(socketId).emit('novo evento', evento);
//    }
//  );
};

// Schemas
var BiometriaSchema = new mongoose.Schema({
  _id: String,
  nome: String,
  perfil: String,
  perfil_acesso: String,
  apartamento: String,
  foto: String,
  observacoes: String,
  data_cadastro: String,
  data_envio: String
});
var VeiculoSchema = new mongoose.Schema({
  _id: String,
  marca: String,
  cor: String,
  placa: String,
  apartamento: String,
  rotulo: String,
  data_cadastro: String,
  data_envio: String
});
var EventoSchema = new mongoose.Schema({
  _id: String,
  codigo: String,
  serial: String,
  local: String,
  tipo: String,
  panico: String,
  bateria_fraca: String,
  data_hora: String
});

var Biometria = mongoose.model('Biometria', BiometriaSchema);
var Veiculo = mongoose.model('Veiculo', VeiculoSchema);
var Evento = mongoose.model('Evento', EventoSchema);

// Routes
app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/online', function (req, res) {
  res.render('online.html', { port: port, ip: ip});
});

app.post('/biometria', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var biometria = { _id: req.body.codigo, nome: req.body.nome, perfil: req.body.perfil, perfil_acesso: req.body.perfil_acesso, apartamento: req.body.apartamento, foto: req.body.foto, observacoes: req.body.observacoes, data_cadastro: req.body.data_cadastro, data_envio: req.body.data_envio };
    db.collection("biometrias").update({ _id : biometria._id }, biometria, {upsert: true})
    res.send();
  }
});

app.get('/biometrias', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    fieldOrder = '_id';
    if(req.query.order){
      fieldOrder = req.query.order;
    }
    Biometria.find({ $query: {}, $orderby: { fieldOrder : -1 } }, (err, biometrias) => {
      res.render('biometrias.html', { biometrias: biometrias})
    });
  }
});

app.post('/veiculo', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var veiculo = { _id: req.body.serial, marca: req.body.marca, cor: req.body.cor, placa: req.body.placa, apartamento: req.body.apartamento, rotulo: req.body.rotulo, data_cadastro: req.body.data_cadastro, data_envio: req.body.data_envio };
    db.collection("veiculos").update({ _id : veiculo._id }, veiculo, {upsert: true})
    res.send();
  }
});

app.get('/veiculos', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
   Veiculo.find({}, (err, veiculos) => {
      res.render('veiculos.html', { veiculos: veiculos})
   });
  }
});

app.post('/evento', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var evento = { tipo: req.body.tipo, codigo: req.body.codigo, serial: req.body.serial, local: req.body.local, panico: req.body.panico, bateria_fraca: req.body.bateria_fraca, data_hora: req.body.data_hora };
    db.collection("eventos").insert(evento);
    //io.emit('novo evento', evento);
    //var cursor = db.collection("socket_ids").find({})
    //while(cursor.hasNext()){
    //  socketId = cursor.next();
    //  console.log('enviando para ' + socketId);
    //  socket.broadcast.to(socketId).emit('novo evento', evento);
    //}
    res.send();
  }
});

app.get('/eventos', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
   Evento.find().sort( { _id : -1 } , (err, eventos) => {
      res.render('eventos.html', { eventos: eventos})
   }).limit(50);
  }
});

// WebSockets
//io.on('connection', function(socket){
//  console.log('user connected ' + socket.id);
//  //db.collection("socket_ids").insert({ _id: socket.id});
//  socket.on('disconnect', function(){
//    console.log('user disconnected ' + socket.id);
//    //db.collection("socket_ids").delete_many({ _id: socket.id})
//  });
//});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
