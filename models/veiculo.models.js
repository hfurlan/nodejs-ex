var mongoose = require('mongoose')

var VeiculoSchema = new mongoose.Schema({
    _id: String,
    marca: String,
    cor: String,
    placa: String,
    apartamento: String,
    rotulo: String,
    data_cadastro: Date,
    data_envio: Date
  });

module.exports = mongoose.model('Veiculo', VeiculoSchema);
