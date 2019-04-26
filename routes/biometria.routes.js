var express = require('express');
var router = express.Router();
var fs = require('fs');

const Biometria = require('../models/biometria.models.js');

router.post('/salvar', function (req, res) {
  var biometria = { _id: req.body.codigo, nome: req.body.nome, perfil: req.body.perfil, perfil_acesso: req.body.perfil_acesso, apartamento: req.body.apartamento, foto: req.body.foto, observacoes: req.body.observacoes, ativo: 'S', data_cadastro: new Date(req.body.data_cadastro), data_envio: new Date(req.body.data_envio) };
  global.db.collection("biometrias").update({ _id : biometria._id }, biometria, {upsert: true})
  if(biometria.foto){
    var b = new Buffer(biometria.foto, 'hex');
    fs.writeFile("public/images/" + biometria._id + ".jpg", b, function (err) {
      if (err) {
          return console.log(err);
      }
    });
  }
  res.send();
});

router.post('/desativar_outros', function (req, res) {
  var ids = req.body.ids;
  global.db.collection("biometrias").update(
    { _id: { $nin: ids } },
    { $set: { ativo: 'N' } }
  )
  res.send();
});

router.get('/', function (req, res) {
  Biometria.find({}, null, { sort: { apartamento : 1 } }, (err, biometrias) => {
    res.render('biometrias.html', { biometrias: biometrias})
  }).limit(50);
});

router.post('/', function (req, res) {
  var query = Biometria.find().sort( { apartamento: 1 }).limit(50);

  for (var fieldName in req.body) {
    if(req.body.hasOwnProperty(fieldName)) {
      if(req.body[fieldName]) {
        query.where(fieldName).equals(req.body[fieldName]);
      }
    }
  }

  query.exec(function(err, biometrias){
    res.render('biometrias.html', { biometrias: biometrias})
  });
});

router.get('/atualizar_fotos_biometrias', function (req, res) {
  Biometria.find({}, (err, biometrias) => {
    biometrias.forEach(function(biometria) {
      if(biometria.foto){
        var b = new Buffer(biometria.foto, 'hex');
        fs.writeFile("public/images/" + biometria._id + ".jpg", b, function (err) {
          if (err) {
              return console.log(err);
          }
        });
      }
    });        
  });
});

module.exports = router;