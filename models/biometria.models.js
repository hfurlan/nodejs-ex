var mongoose = require('mongoose')

var BiometriaSchema = new mongoose.Schema({
    _id: String,
    nome: String,
    perfil: String,
    perfil_acesso: String,
    apartamento: String,
    foto: String,
    observacoes: String,
    ativo: String,
    data_cadastro: Date,
    data_envio: Date
  });

module.exports = mongoose.model('Biometria', BiometriaSchema);
