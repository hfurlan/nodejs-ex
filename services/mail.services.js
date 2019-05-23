const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'xxxxxx@xxxxx',
    pass: '123123132123'
  }
});

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
    from: 'xxxxxx@xxxxx',
    to: getMailReceivers(mailReceivers),
    subject: subject,
    html: html
  };
}

module.exports = { // export the sendMail function here

sendHtmlMail: function(mailReceivers, subject, html){ // send the email
    emailTransporter.sendMail(getMailOptions(mailReceivers, subject, html), function(error, info){
      if (error) {
        throw error;
      } else {
        console.log(info.response);
      }
    });
  }
};