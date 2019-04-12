var express = require('express');
var router = express.Router();

const Evento = require('../models/evento.models.js');

router.post('/salvar', function (req, res) {
  var evento = { tipo: req.body.tipo, codigo: req.body.codigo, serial: req.body.serial, local: req.body.local, panico: req.body.panico, bateria_fraca: req.body.bateria_fraca, data_hora: new Date(parseInt(req.body.data_hora)) };
  global.db.collection("eventos").insertOne(evento);
  res.send();
});

router.get('/', function (req, res) {
  Evento.find({}, null, { sort: { data_hora: -1 } }, (err, eventos) => {
    res.render('eventos.html', { eventos: eventos})
  }).limit(50);
});

module.exports = router;