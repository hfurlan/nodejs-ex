//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var fs = require('fs');

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(morgan('combined'))
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + '/public'))

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
  data_cadastro: Date,
  data_envio: Date
});
var VeiculoSchema = new mongoose.Schema({
  _id: String,
  marca: String,
  cor: String,
  placa: String,
  apartamento: String,
  rotulo: String,
  data_cadastro: Date,
  data_envio: Date
});
var EventoSchema = new mongoose.Schema({
  _id: String,
  codigo: String,
  serial: String,
  local: String,
  tipo: String,
  panico: String,
  bateria_fraca: String,
  data_hora: Date
});

var Biometria = mongoose.model('Biometria', BiometriaSchema);
var Veiculo = mongoose.model('Veiculo', VeiculoSchema);
var Evento = mongoose.model('Evento', EventoSchema);

// Routes
app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/login', function (req, res) {
  res.render('login.html');
});

app.post('/biometria', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var biometria = { _id: req.body.codigo, nome: req.body.nome, perfil: req.body.perfil, perfil_acesso: req.body.perfil_acesso, apartamento: req.body.apartamento, foto: req.body.foto, observacoes: req.body.observacoes, data_cadastro: new Date(parseInt(req.body.data_cadastro)), data_envio: new Date(parseInt(req.body.data_envio)) };
    db.collection("biometrias").update({ _id : biometria._id }, biometria, {upsert: true})
    if(biometria.foto){
      var b = new Buffer(biometria.foto, 'hex');
      fs.writeFile("public/images/" + biometria._id + ".jpg", b, function (err) {
        if (err) {
            return console.log(err);
        }
      });
    }
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
    Biometria.find({}, null, { sort: { apartamento : 1 } }, (err, biometrias) => {
      res.render('biometrias.html', { biometrias: biometrias})
    });
  }
});

app.get('/atualizar_fotos_biometrias', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    Biometria.find({}, (err, biometrias) => {
      if(biometria.foto){
        var b = new Buffer(biometria.foto, 'hex');
        fs.writeFile("public/images/" + biometria._id + ".jpg", b, function (err) {
          if (err) {
              return console.log(err);
          }
        });
      }
    });
  }
});

app.post('/veiculo', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var veiculo = { _id: req.body.serial, marca: req.body.marca, cor: req.body.cor, placa: req.body.placa, apartamento: req.body.apartamento, rotulo: req.body.rotulo, data_cadastro: new Date(parseInt(req.body.data_cadastro)), data_envio: new Date(parseInt(req.body.data_envio)) };
    db.collection("veiculos").update({ _id : veiculo._id }, veiculo, {upsert: true})
    res.send();
  }
});

app.get('/veiculos', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
   Veiculo.find({}, null, { sort: { apartamento : 1 } }, (err, veiculos) => {
      res.render('veiculos.html', { veiculos: veiculos})
   });
  }
});

app.post('/evento', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var evento = { tipo: req.body.tipo, codigo: req.body.codigo, serial: req.body.serial, local: req.body.local, panico: req.body.panico, bateria_fraca: req.body.bateria_fraca, data_hora: new Date(parseInt(req.body.data_hora)) };
    db.collection("eventos").insertOne(evento);
    res.send();
  }
});

app.get('/eventos', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
   Evento.find({}, null, { sort: { data_hora: -1 } }, (err, eventos) => {
      res.render('eventos.html', { eventos: eventos})
   }).limit(50);
  }
});

app.get('/online', function (req, res) {
  res.render('online.html')
});

app.post('/online_biometria', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    console.log('evento_biometria_id:%s', req.body.evento_biometria_id);
    Evento.findOne({ tipo: 'B', codigo: { $ne: null }, codigo: { $ne: '' }, _id: { $ne: req.body.evento_biometria_id } }, { foto: 0 }, { sort: { data_hora: -1 } }, (err, evento_biometria) => {
      if (err) throw err;
      if (evento_biometria == null) return;

      // Buscar a biometria associada ao evento
      Biometria.findOne({ _id: evento_biometria.codigo}, { foto: 0 }, (err, biometria) => {
        if (biometria == null) return;
        var evento = evento_biometria.toObject();
        evento.biometria = biometria;

        // Buscar biometrias do mesmo apartamento
        Biometria.find({ $query: { apartamento: biometria.apartamento, _id: { $ne: evento_biometria.codigo } } }, { foto: 0 }, (err, biometrias_associadas) => {
          evento.biometrias_associadas = biometrias_associadas;

          // Retornar o evento populado com todas as informacoes necessarias para a tela
          console.log('Evento:%j', evento);
          res.setHeader('Content-Type', 'application/json');
          res.send(evento);
        });
      });
    });
  }
});

app.post('/online_veiculo', function (req, res) {
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    console.log('evento_veiculo_id:%s', req.body.evento_veiculo_id);
    Evento.findOne({ tipo: 'L', serial: { $ne: null }, serial: { $ne: '' }, _id: { $ne: req.body.evento_veiculo_id } }, null, { sort: { data_hora: -1 } }, (err, evento_veiculo) => {
      if (err) throw err;
      if (evento_veiculo == null) return;

      // Buscar o veiculo associada ao evento
      Veiculo.findOne({ _id: evento_veiculo.serial}, (err, veiculo) => {
        if (veiculo == null) return;
        var evento = evento_veiculo.toObject();
        evento.veiculo = veiculo;

        // Buscar veiculos do mesmo apartamento
        Veiculo.find({ $query: { apartamento: veiculo.apartamento, _id: { $ne: evento_veiculo.serial } } }, (err, veiculos_associados) => {
          evento.veiculos_associados = veiculos_associados;

          // Buscar biometrias do mesmo apartamento
          Biometria.find({ $query: { apartamento: veiculo.apartamento } }, { foto: 0 }, (err, biometrias_associadas) => {
            evento.biometrias_associadas = biometrias_associadas;

            // Retornar o evento populado com todas as informacoes necessarias para a tela
            console.log('Evento:%j', evento);
            res.setHeader('Content-Type', 'application/json');
            res.send(evento);
          });
        });
      });
    });
  }
});

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
