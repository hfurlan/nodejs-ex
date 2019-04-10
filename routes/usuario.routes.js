var express = require('express');
var router = express.Router();

const Usuario = require('../models/usuario.models.js');

router.get('/', function (req, res) {
    Usuario.find({}, null, null, (err, usuarios) => {
        res.render('usuarios.html', { usuarios: usuarios})
    });
});

router.get('/novo', function (req, res) {
    res.render('usuario.html')
});

router.get('/editar', function (req, res) {
  Usuario.findOne({ id: req.query.id }).exec(function (err, usuario) {
    res.render('usuario.html', { usuario: usuario})
  });
});

router.post('/salvar', function (req, res) {
    if (req.body.login && req.body.senha) {
        if (req.body.id != ''){
            var usuarioData = {
                login: req.body.login,
                senha: req.body.senha,
            }
            Usuario.create(usuarioData, function (err, user) {
                if (err) {
                    return next(err)
                } else {
                    return res.redirect('/usuarios');
                }
            });    
        }
        else {
            var usuarioData = {
                id: req.body.id,
                login: req.body.login,
                senha: req.body.senha,
            }
            Usuario.updateOne(usuarioData, function (err, user) {
                if (err) {
                    return next(err)
                } else {
                    return res.redirect('/usuarios');
                }
            });    
        }
    }
});

module.exports = router;