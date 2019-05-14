var express = require('express');
var router = express.Router();

const Config = require('../models/config.models.js');

router.get('/', function (req, res) {
    Config.find({}, null, {}, (err, configs) => {
        res.render('configs.html', { configs: configs})
    });
});

router.get('/novo', function (req, res) {
    res.render('config.html')
});

router.get('/editar', function (req, res) {
  Config.findOne({ _id: req.query.id }).exec(function (err, config) {
    res.render('config.html', { config: config})
  });
});

router.get('/remover', function (req, res) {
  Config.deleteOne({ _id: req.query.id }).exec(function (err, config) {
    return res.redirect('/configs');
  });
});

router.post('/salvar', function (req, res) {
    if (req.body.id && req.body.valor) {
        var config = { _id: req.body.id, valor: req.body.valor };
        global.db.collection("configs").update({ _id : config._id }, config, {upsert: true})
    }
    return res.redirect('/configs');
});

module.exports = router;