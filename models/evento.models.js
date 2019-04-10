var mongoose = require('mongoose')

var EventoSchema = new mongoose.Schema({
    _id: String,
    codigo: String,
    serial: String,
    local: String,
    tipo: String,
    panico: String,
    bateria_fraca: String,
    data_hora: Date
  });

module.exports = mongoose.model('Evento', EventoSchema);
