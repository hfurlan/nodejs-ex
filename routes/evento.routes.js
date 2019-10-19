var express = require('express');
var router = express.Router();

const Evento = require('../models/evento.models.js');
const Veiculo = require('../models/veiculo.models.js');
const Biometria = require('../models/biometria.models.js');
const MailService = require('../services/mail.services.js');
const PortalProprietario = require('../models/portalproprietario.models.js');

router.post('/salvar', async function (req, res) {
  var bloco = "-";
  var apartamento = "-";
  if(req.body.tipo == 'L' && req.body.serial != '' && req.body.serial != '0000000'){
    var veiculo = await buscarVeiculo(req.body.serial);
    if(veiculo){
      apartamento = veiculo.apartamento;
      bloco = veiculo.bloco;
      veiculo.data_ultimo_evento = new Date();
      global.db.collection("veiculos").updateOne({ _id : veiculo._id }, veiculo);
      if(req.body.bateria_fraca == 'S'){
        var proprietarios = await buscarPortalProprietario('' + parseInt(apartamento));
        var emailsTo = [];
        proprietarios.forEach(function(proprietario) {
          emailsTo.push(proprietario.email)
        });  
        var titulo = 'PLENO SANTA CRUZ - APTO ' + apartamento + ': AVISO CONTROLE VEICULO BATERIA FRACA'
        var html = 'O sistema de controle de acesso do seu condominio identificou que controle de veiculo da sua unidade esta com a bateria fraca. MARCA:' + veiculo.marca + ' - COR:' + veiculo.cor + ' - PLACA:' + veiculo.placa + '. Favor trocar a bateria/pilha ou comparecer na administracao para ajuda.'
        //MailService.sendHtmlMail(emailsTo, titulo, html);
      }
    }
  } else if(req.body.tipo == 'B'){
    var biometria = await buscarBiometria(req.body.codigo);
    if(biometria){
      apartamento = biometria.apartamento;
      bloco = biometria.bloco;
      biometria.data_ultimo_evento = new Date();
      global.db.collection("biometrias").updateOne({ _id : biometria._id }, biometria);
    }
  }
  var evento = { tipo: req.body.tipo, codigo: req.body.codigo, serial: req.body.serial, local: req.body.local, panico: req.body.panico, bateria_fraca: req.body.bateria_fraca, data_hora: new Date(req.body.data_hora), apartamento: apartamento, bloco: bloco };
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

function buscarPortalProprietario(apartamento){
  var promise = new Promise(function(resolve, reject) { 
    PortalProprietario.find( { ativo: 'S', apartamento: apartamento }, null, {}, (err, proprietarios) => {
      resolve(proprietarios)
    });
  });
  return promise;
}

module.exports = router;