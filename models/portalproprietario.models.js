var mongoose = require('mongoose')

var PortalProprietarioSchema = new mongoose.Schema({
    _id: String,
    apartamento: String,
    nome: String,
    email: String,
    ativo: String, 
    data_cadastro: Date,
    data_envio: Date
  });

module.exports = mongoose.model('PortalProprietario', PortalProprietarioSchema);
