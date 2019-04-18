var express = require('express');
var router = express.Router();

const Usuario = require('../models/usuario.models.js');

router.get('/', function (req, res) {

    var perPage = 10, page = Math.max(0, req.param('page'))

    Usuario.find()
    .limit(perPage)
    .skip(perPage * page)
    .sort({
        login: 'asc'
    })
    .exec(function(err, usuarios) {
        Usuario.count().exec(function(err, count) {
            res.render('usuarios.html', {
                usuarios: usuarios,
                page: page,
                pages: count / perPage
            })
        })
    });
});

router.get('/novo', function (req, res) {
    res.render('usuario.html')
});

router.get('/editar', function (req, res) {
  Usuario.findOne({ _id: req.query.id }).exec(function (err, usuario) {
    res.render('usuario.html', { usuario: usuario})
  });
});

router.get('/remover', function (req, res) {
  Usuario.deleteOne({ _id: req.query.id }).exec(function (err, usuario) {
    return res.redirect('/usuarios');
  });
});

router.post('/salvar', function (req, res) {
    if (req.body.login && req.body.senha) {
        if (req.body.id == ''){
            var usuarioData = {
                login: req.body.login,
                senha: req.body.senha,
            }
            Usuario.create(usuarioData, function (err, user) {
                if (err) {
                    res.render('usuario.html', { usuario: usuarioData, error_msg: err} )
                } else {
                    return res.redirect('/usuarios');
                }
            });
        }
        else {
            var usuarioData = {
                _id: req.body.id,
                login: req.body.login,
                senha: req.body.senha,
            }
            Usuario.update({ _id: req.body.id }, usuarioData, function (err, user) {
                if (err) {
                    res.render('usuario.html', { usuario: usuarioData, error_msg: err} )
                } else {
                    return res.redirect('/usuarios');
                }
            });    
        }
    }
});

module.exports = router;