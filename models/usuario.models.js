var mongoose = require('mongoose')

var UsuarioSchema = new mongoose.Schema({
    login: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    senha: {
      type: String,
      required: true,
    }
  });

module.exports = mongoose.model('Usuario', UsuarioSchema);
