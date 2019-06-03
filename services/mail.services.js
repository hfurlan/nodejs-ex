const nodemailer = require('nodemailer');
const Config = require('../models/config.models.js');

var host;
var port;
var user;
var pass;
var from;
var emailTransporter;

function getMailReceivers(mailReceivers){ // convert the string array to one string
  var receivers = "";

  for(var i = 0; i < mailReceivers.length; i++){
    receivers += mailReceivers[i];

    if(i < mailReceivers.length - 1)
        receivers += ", ";
  }

  return receivers;
}

function getMailOptions(mailReceivers, subject, html){ // set the mail options and return them
  return {
    from: from,
    to: getMailReceivers(mailReceivers),
    subject: subject,
    html: html
  };
}

function buscarConfig(id){
  var promise = new Promise(function(resolve, reject) { 
    Config.findOne({ _id: id }).exec(function (err, config) {
      resolve(config.valor);
    });
  });
  return promise;
}

module.exports = { // export the sendMail function here

  sendHtmlMail: async function(mailReceivers, subject, html){ // send the email
    if(emailTransporter == null){
      host = await buscarConfig("smtp.host");
      port = await buscarConfig("smtp.port");
      user = await buscarConfig("smtp.username");
      pass = await buscarConfig("smtp.password");
      from = await buscarConfig("smtp.from");
  
      emailTransporter = nodemailer.createTransport({
        host: host,
        port: parseInt(port),
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: user,
          pass: pass
        }
      });
    }

    emailTransporter.sendMail(getMailOptions(mailReceivers, subject, html), function(error, info){
      if (error) {
        throw error;
      } else {
        console.log(info.response);
      }
    });
  },
};