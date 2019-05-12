var mongoose = require('mongoose')

var PortalMoradorSchema = new mongoose.Schema({
    _id: String,
    apartamento: String,
    nome: String,
    rg: String,
    data_nascimento: Date,
    ativo: String, 
    data_cadastro: Date,
    data_envio: Date
  }, { collection: 'portalmoradores' });

module.exports = mongoose.model('PortalMorador', PortalMoradorSchema);
