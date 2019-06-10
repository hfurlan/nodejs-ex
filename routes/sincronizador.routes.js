var express = require('express');
var http = require("http");
var router = express.Router();

const Config = require('../models/config.models.js');

router.get('/', async function (req, res) {

    config = await buscarConfig();
    if(config == null){
      res.render('sincronizador.html', { msg: "configuracao sincronizador.url nao encontrada"});
      return;
    }

    http.get(config.valor + "status", (resp) => {
      let data = '';
    
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });
    
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        obj = JSON.parse(data);  
        res.render('sincronizador.html', { msg: obj});
      });
    
    }).on("error", (err) => {
      res.render('sincronizador.html', { msg: err.message});
    });
});


router.get('/restart', async function (req, res) {

  config = await buscarConfig();
  if(config == null){
    res.render('sincronizador.html', { msg: "configuracao sincronizador.url nao encontrada"});
    return;
  }

  http.get(config.valor + "restart", (resp) => {
    let data = '';
  
    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      res.render('sincronizador.html', { msg: data});
    });
  
  }).on("error", (err) => {
    res.render('sincronizador.html', { msg: err.message});
  });
});

function buscarConfig(){
  var promise = new Promise(function(resolve, reject) { 
    Config.findOne({ _id: "sincronizador.url" }).exec(function (err, config) {
      resolve(config);
    });
  });
  return promise;
}

module.exports = router;