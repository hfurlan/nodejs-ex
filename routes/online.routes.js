var express = require('express');
var router = express.Router();

const Evento = require('../models/evento.models.js');
const Biometria = require('../models/biometria.models.js');
const Veiculo = require('../models/veiculo.models.js');

router.get('/', function (req, res) {
  Evento.find({}).distinct('local', function(err, evento_locais) {
    res.render('online.html', { evento_locais: evento_locais})
  });
});

router.post('/online_biometria', function (req, res) {
  console.log('evento_biometria_id:%s', req.body.evento_biometria_id);
  console.log('evento_local:%s', req.body.evento_local);
  search = { tipo: 'B', codigo: { $ne: null }, codigo: { $ne: '' }, _id: { $ne: req.body.evento_biometria_id } }
  if (req.body.evento_local !== '') {
    search = { tipo: 'B', codigo: { $ne: null }, codigo: { $ne: '' }, _id: { $ne: req.body.evento_biometria_id }, local: req.body.evento_local }
  }
  Evento.findOne(search, { foto: 0 }, { sort: { data_hora: -1 } }, (err, evento_biometria) => {
    if (err) throw err;
    if (evento_biometria == null || evento_biometria._id === req.body.evento_biometria_id) {
      res.setHeader('Content-Type', 'application/json');
      res.send({});
      return
    }

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
});

router.post('/online_veiculo', function (req, res) {
  console.log('evento_veiculo_id:%s', req.body.evento_veiculo_id);
  Evento.findOne({ tipo: 'L', serial: { $ne: null }, serial: { $ne: '' }, _id: { $ne: req.body.evento_veiculo_id } }, null, { sort: { data_hora: -1 } }, (err, evento_veiculo) => {
    if (err) throw err;
    if (evento_veiculo == null || evento_veiculo._id === req.body.evento_veiculo_id) {
      res.setHeader('Content-Type', 'application/json');
      res.send({});
      return
    }

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
});

module.exports = router;