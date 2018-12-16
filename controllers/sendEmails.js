const nodemailer = require('nodemailer');
//require('dotenv').config();

const sendEmail = (invoice_num,email) =>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'najlepsierakety@gmail.com',
          clientId: '52937241797-60eqi172bsbsvenva58neeqsoao4irf2.apps.googleusercontent.com',
          clientSecret: '3S70Y0dDpujob7Rn9oyLezfi',
          refreshToken: '1/wJW_ABCxm2As6OHvV2niwfV7wRCU7BbR8U5ttrXgASSpfREQhVhe0BB7lsdcv7Iz',
          accessToken: 'ya29.GltzBoVBrSMYPXaJzbKTQmsW14kB15gO2YHlu-iZJ2d1xo2OmM5yTBeilpIH8HQrODCskQ8nYy2tMxzMPHKJoWAenupu95cSZQLgk6S7xXdZ55Hj5gtBG2FdO65G'
        },
      });
    
    
    var mailOption = {
        from: 'najlepsierakety@gmail.com',
        to: `${email}`,
        subject: `Faktura c.${invoice_num}`,
        text: 'Dakujeme za nakup najlepsiej rakety.',
        attachments: [{
            filename: `faktura-${invoice_num}.pdf`,
            path: `./Faktury/faktura-${invoice_num}.pdf`,
            contentType: 'application/pdf'
          }]};
    
    
    transporter.sendMail(mailOption, (err, res)=>{
        if (err) return console.log(err);
        console.log('Email send sucessfully.');
    })
}


module.exports = {sendEmail}