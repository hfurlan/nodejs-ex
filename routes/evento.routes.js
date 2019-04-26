var express = require('express');
var router = express.Router();

const Evento = require('../models/evento.models.js');

router.post('/salvar', function (req, res) {
  var evento = { tipo: req.body.tipo, codigo: req.body.codigo, serial: req.body.serial, local: req.body.local, panico: req.body.panico, bateria_fraca: req.body.bateria_fraca, data_hora: new Date(req.body.data_hora) };
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

module.exports = router;