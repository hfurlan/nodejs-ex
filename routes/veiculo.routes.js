var express = require('express');
var router = express.Router();

const Veiculo = require('../models/veiculo.models.js');
const Evento = require('../models/evento.models.js');

router.post('/salvar', function (req, res) {
  var veiculo = { _id: req.body.serial, marca: req.body.marca, cor: req.body.cor, placa: req.body.placa, apartamento: req.body.apartamento, rotulo: req.body.rotulo, ativo: 'S', data_cadastro: new Date(req.body.data_cadastro), data_envio: new Date(req.body.data_envio) };
  global.db.collection("veiculos").update({ _id : veiculo._id }, veiculo, {upsert: true})
  res.send();
});

router.get('/ativos', function (req, res) {
  Veiculo.find( { ativo: 'S' }, null, { sort: { apartamento : 1 } }, (err, veiculos) => {
    res.send( { veiculos: veiculos } )
  });
});

router.post('/desativar', function (req, res) {
  var id = req.body.id;
  global.db.collection("veiculos").update(
    { _id: id },
    { $set: { ativo: 'N' } }
  )
  res.send();
});

router.get('/', function (req, res) {
  Veiculo.find({}, null, { sort: { apartamento : 1 } }, (err, veiculos) => {
    res.render('veiculos.html', { veiculos: veiculos})
  }).limit(50);
});

router.post('/', function (req, res) {
  var query = Veiculo.find().sort( { apartamento: 1 }).limit(50);

  for (var fieldName in req.body) {
    if(req.body.hasOwnProperty(fieldName)) {
      if(req.body[fieldName]) {
        query.where(fieldName).equals(req.body[fieldName]);
      }
    }
  }

  query.exec(function(err, veiculos){
    res.render('veiculos.html', { veiculos: veiculos})
  });
});

// procurar veiculo que nao tenha evento a mais de 90 dias
router.get('/expirados', function (req, res) {
  var d = new Date();
  d.setDate(d.getDate() - 90); //minus 90 days
  console.log(`Procurando veiculos sem evento posteriores a data ${d}`);
  var veiculos_expirados = [];
  Veiculo.find({ativo: 'S'}, null, { sort: { apartamento : 1 } }, async function (err, veiculos) {
    console.log(`Veiculos encontrados = ${veiculos.length}`);
    for (i = 0; i < veiculos.length; i++) { 
      var veiculo = veiculos[i];
      console.log(`Veiculo ${veiculo._id}`);
      var expirado = await isExpirado(veiculo._id, d);
      console.log(`Veiculo expirado ${expirado}`);
      if (expirado) {
        veiculos_expirados.push(veiculo);
      }  
    }
    res.render('veiculos.html', { veiculos: veiculos_expirados});
  });
});

// procurar veiculo que esta com aviso de bateria fraca
router.get('/bateria_fraca', function (req, res) {
  var veiculos_bateria_fraca = [];
  Veiculo.find({ativo: 'S'}, null, { sort: { apartamento : 1 } }, async function (err, veiculos) {
    console.log(`Veiculos encontrados = ${veiculos.length}`);
    for (i = 0; i < veiculos.length; i++) { 
      var veiculo = veiculos[i];
      console.log(`Veiculo ${veiculo._id}`);
      var bateriaFraca = await isBateriaFraca(veiculo._id);
      console.log(`Veiculo bateriaFraca ${bateriaFraca}`);
      if (bateriaFraca) {
        veiculos_bateria_fraca.push(veiculo);
      }  
    }
    res.render('veiculos.html', { veiculos: veiculos_bateria_fraca});
  });
});

function isBateriaFraca(id){
  var promise = new Promise(function(resolve, reject) { 
    Evento.find({ serial: id, tipo: 'L' }, null, { sort: { data_hora : -1 } }, (err, eventos) => {
      resolve(eventos.length == 1 && eventos[0].bateria_fraca == 'S');
    });
  });
  return promise;
}

function isExpirado(id, dataLimite){
  var promise = new Promise(function(resolve, reject) { 
    Evento.find({ serial: id, tipo: 'L', data_hora: { $lt: dataLimite }, data_hora: { $not: { $gt: dataLimite } } }, null, {}, (err, eventos) => {
      console.log(`Eventos do ${id} = ${eventos.length}`);
      resolve(eventos.length == 0);
    });  
  });
  return promise;
}

module.exports = router;