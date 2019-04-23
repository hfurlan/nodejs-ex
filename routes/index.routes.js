var express = require('express');
var router = express.Router();

const Usuario = require('../models/usuario.models.js');

router.get('/', function (req, res) {
  res.render('index.html');
});

router.get('/login', function (req, res) {
  res.render('login.html');
});

router.post('/login', function (req, res) {
  Usuario.findOne({ login: req.body.login })
    .exec(function (err, usuario) {
      if (err) {
        console.error(err.stack);
        res.status(500).send('Something bad happened!');
      } else if (!usuario || usuario.senha != req.body.senha) {
        res.render('login.html', {error_msg: 'Login invalido'});
      } else {
        req.session.usuario = usuario;
        return res.redirect('/online');
      }
    });
});

router.get('/logout', function(req, res, next) {
  if (req.session) {
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.get('/carga', function (req, res) {
  var biometria = { _id: '123', nome: 'Teste 123', perfil: 'Morador', perfil_acesso: '000', apartamento: '111', ativo: 'S', data_cadastro: new Date(), data_envio: new Date() };
  db.collection("biometrias").update({ _id : biometria._id }, biometria, {upsert: true})
  var biometria = { _id: '124', nome: 'Teste 124', perfil: 'Morador', perfil_acesso: '000', apartamento: '111', ativo: 'S', data_cadastro: new Date(), data_envio: new Date() };
  db.collection("biometrias").update({ _id : biometria._id }, biometria, {upsert: true})
  var evento = { tipo: 'B', codigo: '123', local: '001', panico: 'N', bateria_fraca: 'N', data_hora: new Date() };
  db.collection("eventos").insertOne(evento);

  var veiculo = { _id: '23467', marca: 'HONDA', cor: 'PRATA', placa: 'EJQ7229', apartamento: '21', rotulo: 'Rotulo', ativo: 'S', data_cadastro: new Date(), data_envio: new Date() };
  db.collection("veiculos").update({ _id : veiculo._id }, veiculo, {upsert: true})
  var evento = { tipo: 'L', serial: '23467', local: '001', panico: 'N', bateria_fraca: 'N', data_hora: new Date() };
  db.collection("eventos").insertOne(evento);

  res.render('index.html');
});

module.exports = router;