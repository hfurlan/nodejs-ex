var express = require('express');
var router = express.Router();

const PortalFuncionario = require('../models/portalfuncionario.models.js');
const PortalMorador = require('../models/portalmorador.models.js');
const PortalProprietario = require('../models/portalproprietario.models.js');
const PortalVeiculo = require('../models/portalveiculo.models.js');
const Veiculo = require('../models/veiculo.models.js');
const Biometria = require('../models/biometria.models.js');

// VEICULO
router.post('/veiculo/salvar', function (req, res) {
  var veiculo = { _id: req.body.id, apartamento: req.body.apartamento, andar_vaga: req.body.andar_vaga, numero_vaga: req.body.numero_vaga, montadora: req.body.montadora, modelo: req.body.modelo, cor: req.body.cor, placa: req.body.placa, apartamento: req.body.apartamento, tipo: req.body.tipo, ativo: 'S', data_cadastro: new Date(req.body.data_cadastro), data_envio: new Date(req.body.data_envio) };
  global.db.collection("portalveiculos").update({ _id : veiculo._id }, veiculo, {upsert: true})
  res.send();
});

router.get('/veiculo/ativos', function (req, res) {
  PortalVeiculo.find( { ativo: 'S' }, null, { sort: { apartamento : 1 } }, (err, veiculos) => {
    res.send( { registros: veiculos } )
  });
});

router.post('/veiculo/desativar', function (req, res) {
  var id = req.body.id;
  global.db.collection("portalveiculos").update(
    { _id: id },
    { $set: { ativo: 'N' } }
  )
  res.send();
});

// FUNCIONARIO
router.post('/funcionario/salvar', function (req, res) {
  var funcionario = { _id: req.body.id, apartamento: req.body.apartamento, nome: req.body.nome, ativo: 'S', data_cadastro: new Date(req.body.data_cadastro), data_envio: new Date(req.body.data_envio) };
  global.db.collection("portalfuncionarios").update({ _id : funcionario._id }, funcionario, {upsert: true})
  res.send();
});

router.get('/funcionario/ativos', function (req, res) {
  PortalFuncionario.find( { ativo: 'S' }, null, { sort: { apartamento : 1 } }, (err, funcionarios) => {
    res.send( { registros: funcionarios } )
  });
});

router.post('/funcionario/desativar', function (req, res) {
  var id = req.body.id;
  global.db.collection("portalfuncionarios").update(
    { _id: id },
    { $set: { ativo: 'N' } }
  )
  res.send();
});

// MORADOR
router.post('/morador/salvar', function (req, res) {
  var morador = { _id: req.body.id, apartamento: req.body.apartamento, nome: req.body.nome, data_nascimento: new Date(req.body.data_nascimento), ativo: 'S', data_cadastro: new Date(req.body.data_cadastro), data_envio: new Date(req.body.data_envio) };
  global.db.collection("portalmoradores").update({ _id : morador._id }, morador, {upsert: true})
  res.send();
});

router.get('/morador/ativos', function (req, res) {
  PortalMorador.find( { ativo: 'S' }, null, { sort: { apartamento : 1 } }, (err, moradores) => {
    res.send( { registros: moradores } )
  });
});

router.post('/morador/desativar', function (req, res) {
  var id = req.body.id;
  global.db.collection("portalmoradores").update(
    { _id: id },
    { $set: { ativo: 'N' } }
  )
  res.send();
});

// PROPRIETARIO
router.post('/proprietario/salvar', function (req, res) {
  var proprietario = { _id: req.body.id, apartamento: req.body.apartamento, nome: req.body.nome, email: req.body.email, ativo: 'S', data_cadastro: new Date(req.body.data_cadastro), data_envio: new Date(req.body.data_envio) };
  global.db.collection("portalproprietarios").update({ _id : proprietario._id }, proprietario, {upsert: true})
  res.send();
});

router.get('/proprietario/ativos', function (req, res) {
  PortalProprietario.find( { ativo: 'S' }, null, { sort: { apartamento : 1 } }, (err, proprietarios) => {
    res.send( { registros: proprietarios } )
  });
});

router.post('/proprietario/desativar', function (req, res) {
  var id = req.body.id;
  global.db.collection("portalproprietarios").update(
    { _id: id },
    { $set: { ativo: 'N' } }
  )
  res.send();
});

router.get('/', async function (req, res) {

  // Buscar todos os veiculos e biometrias
  var veiculos = await buscarVeiculos();
  console.log('Veiculos:' + veiculos.length);

  var biometrias = await buscarBiometrias();
  console.log('Biometrias:' + biometrias.length);

  // Buscar todos os proprietarios, funcionarios, moradores e veiculos do portal 
  var portalVeiculos = await buscarPortalVeiculos();
  console.log('Portal Veiculos:' + portalVeiculos.length);

  var portalProprietarios = await buscarPortalProprietarios();
  console.log('Portal Proprietarios:' + portalProprietarios.length);

  var portalFuncionarios = await buscarPortalFuncionarios();
  console.log('Portal Funcionarios:' + portalFuncionarios.length);

  var portalMoradores = await buscarPortalMoradores();
  console.log('Portal Moradores:' + portalMoradores.length);

  // Identificar quais sao os numeros das unidades para posterior agrupamento
  var apartamentos = [];
  for (i = 0; i < portalProprietarios.length; i++) { 
    var apartNum = portalProprietarios[i].apartamento;
    apartamentos[apartNum] = { numero: apartNum, situacao: 'green', local: { veiculos: [], biometrias: [] }, portal: { proprietarios: [], funcionarios: [], veiculos: [], moradores: [] } };
  }
  console.log('Total Apartamentos:' + apartamentos.length);

  // Veiculos
  for (i = 0; i < veiculos.length; i++) { 
    var veiculo = veiculos[i];
    if(veiculo.apartamento){
      var apartamento = "" + parseInt(veiculo.apartamento)
      if(apartamentos[apartamento]){
        apartamentos[apartamento].local.veiculos.push(veiculo);
      }
    }
  }

  // Biometrias
  for (i = 0; i < biometrias.length; i++) { 
    var biometria = biometrias[i];
    if(biometria.apartamento){
      var apartamento = "" + parseInt(biometria.apartamento)
      if(apartamentos[apartamento]){
        apartamentos[apartamento].local.biometrias.push(biometria);
      }  
    }
  }

  // Portal Veiculos
  for (i = 0; i < portalVeiculos.length; i++) { 
    var portalVeiculo = portalVeiculos[i];
    apartamentos[portalVeiculo.apartamento].portal.veiculos.push(portalVeiculo);
  }

  // Portal Proprietarios
  for (i = 0; i < portalProprietarios.length; i++) { 
    var portalProprietario = portalProprietarios[i];
    apartamentos[portalProprietario.apartamento].portal.proprietarios.push(portalProprietario);
  }

  // Portal Moradores
  for (i = 0; i < portalMoradores.length; i++) { 
    var portalMorador = portalMoradores[i];
    apartamentos[portalMorador.apartamento].portal.moradores.push(portalMorador);
  }

  // Portal Funcionarios
  for (i = 0; i < portalFuncionarios.length; i++) { 
    var portalFuncionario = portalFuncionarios[i];
    apartamentos[portalFuncionario.apartamento].portal.funcionarios.push(portalFuncionario);
  }

  // Ordenar os nomes
  for (i = 0; i < apartamentos.length; i++) {
    var apartamento = apartamentos[i];
    if(apartamento){
      apartamento.local.veiculos.sort(function (a, b) {
        return a.placa.toUpperCase().localeCompare(b.placa.toUpperCase());
      });
      apartamento.local.biometrias.sort(function (a, b) {
        return a.nome.toUpperCase().localeCompare(b.nome.toUpperCase());
      });
      apartamento.portal.veiculos.sort(function (a, b) {
        return a.placa.toUpperCase().localeCompare(b.placa.toUpperCase());
      });
      apartamento.portal.funcionarios.sort(function (a, b) {
        return a.nome.toUpperCase().localeCompare(b.nome.toUpperCase());
      });
      apartamento.portal.proprietarios.sort(function (a, b) {
        return a.nome.toUpperCase().localeCompare(b.nome.toUpperCase());
      });
      apartamento.portal.moradores.sort(function (a, b) {
        return a.nome.toUpperCase().localeCompare(b.nome.toUpperCase());
      });  
      
      // Se nao bater as quantidades entao a situacao vai ficar RED
      if(apartamento.local.veiculos.length != apartamento.portal.veiculos.length || apartamento.local.biometrias.length != ( apartamento.portal.funcionarios.length + apartamento.portal.proprietarios.length + apartamento.portal.moradores.length )){
        apartamento.situacao = 'red';
      }
      if(apartamento.local.veiculos.length == apartamento.portal.veiculos.length && apartamento.local.biometrias.length == ( apartamento.portal.funcionarios.length + apartamento.portal.proprietarios.length + apartamento.portal.moradores.length )){
        for (j = 0; j < apartamento.local.veiculos; j++) {
          if(apartamento.local.veiculos[j].placa != apartamento.portal.veiculos[j].placa){
            apartamento.situacao = 'yellow';
            break;
          }
        }
      }
    }
  }
  
  // Caso tenha enviado algum filtro, entao os demais registros que nao estao no filtro devem ser removidos
  if(req.param('apartamento')){
    for( var i = 0; i < apartamentos.length; i++){ 
      if(apartamentos[i]){
        if ( apartamentos[i].numero != req.param('apartamento')) {
          apartamentos.splice(i, 1); 
          i--;          
        }  
      }
    }
  }
  if(req.param('situacao')){
    for( var i = 0; i < apartamentos.length; i++ ){ 
      if(apartamentos[i]){
        if ( apartamentos[i].situacao != req.param('situacao')) {
          apartamentos.splice(i, 1); 
          i--;          
        }  
      }
    }
  }

  console.log(apartamentos.length);

  res.render('portal.html', { apartamentos: apartamentos })
});

function buscarPortalVeiculos(){
  var promise = new Promise(function(resolve, reject) { 
    PortalVeiculo.find({ ativo: 'S' }, null, {}, (err, veiculos) => {
      resolve(veiculos);
    });
  });
  return promise;
}

function buscarPortalProprietarios(){
  var promise = new Promise(function(resolve, reject) { 
    PortalProprietario.find({ ativo: 'S' }, null, {}, (err, proprietarios) => {
      resolve(proprietarios);
    });
  });
  return promise;
}

function buscarPortalMoradores(){
  var promise = new Promise(function(resolve, reject) { 
    PortalMorador.find({ ativo: 'S' }, null, {}, (err, moradores) => {
      resolve(moradores);
    });
  });
  return promise;
}

function buscarPortalFuncionarios(){
  var promise = new Promise(function(resolve, reject) { 
    PortalFuncionario.find({ ativo: 'S' }, null, {}, (err, funcionarios) => {
      resolve(funcionarios);
    });
  });
  return promise;
}

function buscarVeiculos(){
  var promise = new Promise(function(resolve, reject) { 
    Veiculo.find({ ativo: 'S' }, null, {}, (err, veiculos) => {
      resolve(veiculos);
    });
  });
  return promise;
}

function buscarBiometrias(){
  var promise = new Promise(function(resolve, reject) { 
    Biometria.find({ ativo: 'S' }, { foto: 0 }, {}, (err, biometrias) => {
      resolve(biometrias);
    });
  });
  return promise;
}

module.exports = router;