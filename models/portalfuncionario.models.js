var mongoose = require('mongoose')

var PortalFuncionarioSchema = new mongoose.Schema({
    _id: String,
    apartamento: String,
    nome: String,
    rg: String,
    ativo: String, 
    data_cadastro: Date,
    data_envio: Date
  });

module.exports = mongoose.model('PortalFuncionario', PortalFuncionarioSchema);
