var express = require('express');
var router = express.Router();

const Evento = require('../models/evento.models.js');
const Biometria = require('../models/biometria.models.js');
const Veiculo = require('../models/veiculo.models.js');

router.get('/', async function (req, res) {
  var veiculos_situacao = await findVeiculosSituacao();
  var biometrias_situacao = await findBiometriasSituacao();
  var eventos_local = await findEventosLocal();
  var eventos_timeline = await findEventosTimeline(req);
  res.render('estatisticas.html', {
    veiculos_situacao: veiculos_situacao, 
    biometrias_situacao: biometrias_situacao, 
    eventos_local: eventos_local,
    eventos_timeline: eventos_timeline
  });
});

router.post('/', async function (req, res) {
  var veiculos_situacao = await findVeiculosSituacao();
  var biometrias_situacao = await findBiometriasSituacao();
  var eventos_local = await findEventosLocal();
  var eventos_timeline = await findEventosTimeline(req);
  res.render('estatisticas.html', {
    veiculos_situacao: veiculos_situacao, 
    biometrias_situacao: biometrias_situacao, 
    eventos_local: eventos_local,
    eventos_timeline: eventos_timeline
  });
});

function findVeiculosSituacao(){
  var promise = new Promise(function(resolve, reject) { 
    Veiculo.aggregate( [ { $group: { _id: '$ativo', total: { $sum: 1 } } } ] ).exec(function(err, veiculos){
      resolve(veiculos);
    });  
  });
  return promise;
}

function findBiometriasSituacao(){
  var promise = new Promise(function(resolve, reject) { 
    Biometria.aggregate( [ { $group: { _id: '$ativo', total: { $sum: 1 } } } ] ).exec(function(err, biometrias){
      resolve(biometrias);
    });  
  });
  return promise;
}

function findEventosLocal(){
  var promise = new Promise(function(resolve, reject) { 
    Evento.aggregate( [ { $group: { _id: '$local', total: { $sum: 1 } } } ] ).exec(function(err, eventos){
      resolve(eventos);
    });  
  });
  return promise;
}

function findEventosTimeline(req){
  var promise = new Promise(function(resolve, reject) { 

    var filtro = {
      $match: { local: { $in: ['001','002','003']}}
    }
    
    // local
    if(req.body.hasOwnProperty('local')) {
      if(req.body['local']) {
        var filtro = {
          $match: { local: req.body['local'] }
        }
      }
    }

    var agrupamento ={
      $group: {
        "_id": { $hour: "$data_hora" },
        "total":{ "$sum": 1}
      } 
    }

    Evento.aggregate([filtro,agrupamento]).exec(function(err, eventos){
      console.log(eventos);
      var resultado = new Array(24).fill(0);
      for(var i = 0; i < eventos.length; i++){
        var evento = eventos[i];
        resultado[evento._id] = evento.total;
      }
      resolve(resultado);
    });
  });
  return promise;
}

module.exports = router;