//  OpenShift sample Node application
var express = require('express');
var morgan  = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var session = require('express-session')

Object.assign = require('object-assign')

var app = express()
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(morgan('combined'))
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + '/public'))

//Inicializar tratamento de sessao
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));

//Adicionar valores da sessao para cada request realizado
app.use(function(req, res, next) {
  if (req.session && req.session.usuario) {
    res.locals.usuario = req.session.usuario;
  }
  next();
});

// Routes
app.use('/', require('./routes/index.routes.js'));
app.use('/usuarios', require('./routes/usuario.routes.js'));
app.use('/biometrias', require('./routes/biometria.routes.js'));
app.use('/veiculos', require('./routes/veiculo.routes.js'));
app.use('/eventos', require('./routes/evento.routes.js'));
app.use('/online', require('./routes/online.routes.js'));
app.use('/online_veiculos', require('./routes/online_veiculos.routes.js'));
app.use('/estatisticas', require('./routes/estatisticas.routes.js'));
app.use('/portal', require('./routes/portal.routes.js'));
app.use('/configs', require('./routes/config.routes.js'));

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

var port = 8080;
var ip = '0.0.0.0';
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

mongoose.connect('mongodb://mongo:27017/sampledb');
global.db = mongoose.connection;

module.exports = app ;
