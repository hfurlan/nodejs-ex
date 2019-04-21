var express = require('express');
var router = express.Router();

const Veiculo = require('../models/veiculo.models.js');
const Evento = require('../models/evento.models.js');

router.post('/salvar', function (req, res) {
  var veiculo = { _id: req.body.serial, marca: req.body.marca, cor: req.body.cor, placa: req.body.placa, apartamento: req.body.apartamento, rotulo: req.body.rotulo, ativo: 'S', data_cadastro: new Date(parseInt(req.body.data_cadastro)), data_envio: new Date(parseInt(req.body.data_envio)) };
  global.db.collection("veiculos").update({ _id : veiculo._id }, veiculo, {upsert: true})
  res.send();
});

router.post('/desativar_outros', function (req, res) {
  var ids = req.body.ids;
  global.db.collection("veiculos").update(
    { _id: { $nin: ids } },
    { $set: { ativo: 'N' } }
  )
  res.send();
});

router.get('/', function (req, res) {
  Veiculo.find({}, null, { sort: { apartamento : 1 } }, (err, veiculos) => {
    res.render('veiculos.html', { veiculos: veiculos})
  });
});

// procurar veiculo que nao tenha evento a mais de 90 dias
router.get('/expirados', function (req, res) {
  var d = new Date();
  d.setDate(d.getDate() - 90); //minus 90 days
  console.log(`Procurando veiculos sem evento posteriores a data ${d}`);
  var veiculos_expirados = [];
  Veiculo.find({}, null, { sort: { apartamento : 1 } }, (err, veiculos) => {
    veiculos.forEach(function(v){
      Evento.find({serial: v._id, data_hora: { $gt: d } }, null, {}, (err, eventos) => {
        if (eventos.length == 0) {
          veiculos_expirados.push(v);
        }
      });
    });
    res.render('veiculos.html', { veiculos: veiculos_expirados});
  });
});

module.exports = router;