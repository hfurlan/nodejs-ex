var mongoose = require('mongoose')

var PortalVeiculoSchema = new mongoose.Schema({
    _id: String,
    apartamento: String,
    tipo: String,
    andar_vaga: String,
    numero_vaga: String,
    placa: String,
    montadora: String,
    modelo: String,
    cor: String,
    ativo: String, 
    data_cadastro: Date,
    data_envio: Date
  });

module.exports = mongoose.model('PortalVeiculo', PortalVeiculoSchema);