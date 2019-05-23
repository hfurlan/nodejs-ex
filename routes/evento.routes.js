var express = require('express');
var router = express.Router();

const Evento = require('../models/evento.models.js');
const Veiculo = require('../models/veiculo.models.js');
const Biometria = require('../models/biometria.models.js');

router.post('/salvar', async function (req, res) {
  var apartamento = "-";
  if(req.body.tipo == 'L'){
    var veiculo = await buscarVeiculo(req.body.serial);
    if(veiculo){
      apartamento = veiculo.apartamento;
      veiculo.data_ultimo_evento = new Date();
      global.db.collection("veiculos").update({ _id : veiculo._id }, veiculo, {upsert: true})
    }
  } else if(req.body.tipo == 'B'){
    var biometria = await buscarBiometria(req.body.codigo);
    if(biometria){
      apartamento = biometria.apartamento;
      biometria.data_ultimo_evento = new Date();
      global.db.collection("biometrias").update({ _id : biometria._id }, biometria, {upsert: true})
    }
  }
  var evento = { tipo: req.body.tipo, codigo: req.body.codigo, serial: req.body.serial, local: req.body.local, panico: req.body.panico, bateria_fraca: req.body.bateria_fraca, data_hora: new Date(req.body.data_hora), apartamento: apartamento };
  global.db.collection("eventos").insertOne(evento);
  res.send();
});

router.get('/', function (req, res) {
  Evento.find({}, null, { sort: { data_hora: -1 } }, (err, eventos) => {
    res.render('eventos.html', { eventos: eventos})
  }).limit(50);
});

router.post('/', function (req, res) {
  var query = Evento.find().sort( { data_hora: -1 }).limit(50);

  for (var fieldName in req.body) {
    if(req.body.hasOwnProperty(fieldName)) {
      if(req.body[fieldName]) {
        query.where(fieldName).equals(req.body[fieldName]);
      }
    }
  }

  query.exec(function(err, eventos){
    res.render('eventos.html', { eventos: eventos})
  });
});

function buscarVeiculo(id){
  var promise = new Promise(function(resolve, reject) { 
    Veiculo.findOne({ _id: id }).exec(function (err, veiculo) {
      resolve(veiculo);
    });
  });
  return promise;
}

function buscarBiometria(id){
  var promise = new Promise(function(resolve, reject) { 
    Biometria.findOne({ _id: id }).exec(function (err, biometria) {
      resolve(biometria);
    });
  });
  return promise;
}

function buscarPortalProprietarioEmails(apartamento){
  var promise = new Promise(function(resolve, reject) { 
    global.db.collection("eventos").find({ apartamento: apartamento }, 'email', function(err, emails){
      resolve(emails);
    });
  });
  return promise;
}

module.exports = router;