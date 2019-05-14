var mongoose = require('mongoose')

var ConfigSchema = new mongoose.Schema({
    _id: String,
    valor: String
  });

module.exports = mongoose.model('Config', ConfigSchema);
