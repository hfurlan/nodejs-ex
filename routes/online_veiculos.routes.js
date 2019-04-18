var express = require('express');
var router = express.Router();

const Evento = require('../models/evento.models.js');
const Veiculo = require('../models/veiculo.models.js');
const Biometria = require('../models/biometria.models.js');

router.get('/', function (req, res) {
  Evento.find({}).distinct('local', function(err, evento_locais) {
    res.render('online_veiculos.html', { evento_locais: evento_locais})
  });
});

router.post('/online_veiculo', function (req, res) {
  var evento_veiculo_id = req.body.evento_veiculo_id;
  console.log('evento_veiculo_id:%s', evento_veiculo_id);
  Evento.findOne({ tipo: 'L', serial: { $ne: null }, serial: { $ne: '' }, _id: { $ne: evento_veiculo_id } }, null, { sort: { data_hora: -1 } }, (err, evento_veiculo) => {
    if (err) throw err;
    if (evento_veiculo == null || evento_veiculo._id === evento_veiculo_id) {
      res.setHeader('Content-Type', 'application/json');
      res.send({});
      return;
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