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
    eventos_timeline: eventos_timeline,
    local: '',
    data_hora_inicio: '',
    data_hora_fim: ''    
  });
});

router.post('/', async function (req, res) {

  var local = req.body['local'];
  var data_hora_inicio = req.body['data_hora_inicio'];
  var data_hora_fim = req.body['data_hora_fim'];

  var veiculos_situacao = await findVeiculosSituacao();
  var biometrias_situacao = await findBiometriasSituacao();
  var eventos_local = await findEventosLocal();
  var eventos_timeline = await findEventosTimeline(local,data_hora_inicio,data_hora_fim);
  res.render('estatisticas.html', {
    veiculos_situacao: veiculos_situacao, 
    biometrias_situacao: biometrias_situacao, 
    eventos_local: eventos_local,
    eventos_timeline: eventos_timeline,
    local: local,
    data_hora_inicio: data_hora_inicio,
    data_hora_fim: data_hora_fim
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

function findEventosTimeline(local, data_hora_inicio, data_hora_fim){
  var promise = new Promise(function(resolve, reject) { 

    Date.prototype.addHours = function(h) {    
      this.setTime(this.getTime() + (h*60*60*1000)); 
      return this;   
    }
    
    var filtro = {
      $match: { }
    }
    
    if(local && data_hora_inicio && data_hora_fim) {
      filtro = {
        $match: { 
          local: local,
          data_hora: { $gt: new Date(data_hora_inicio + 'T00:00:00Z').addHours(-3), $lt: new Date(data_hora_fim + 'T23:59:59Z').addHours(-3) }
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
      var resultado = new Array(24).fill(0);
      for(var i = 0; i < eventos.length; i++){
        var evento = eventos[i];

        // Devido ao horario no BD ser UTC, sera aplicado logica para ajustar para o Brasil
        var hora = evento._id;
        if(hora > 2){
          hora = hora - 3
        } else if (hora == 2) {
          hora = 23;
        } else if (hora == 1) {
          hora = 22;
        } else if (hora == 0) {
          hora = 21;
        }
        resultado[hora] = evento.total;
      }
      resolve(resultado);
    });
  });
  return promise;
}

module.exports = router;