const nodemailer = require('nodemailer');
//require('dotenv').config();

const reorderRakets = () =>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'najlepsierakety@gmail.com',
          clientId: '555774590777-49c9u688up2j5c1juhhuhltvqqc67kl5.apps.googleusercontent.com',
          clientSecret: 'BjqeVuKJahj5QrmATFZ_IyL1',
          refreshToken: '1/NqNZcrBcToQxIs2CUF3YZeDbZonULgG2BTZCA1ANalU',
          accessToken: 'ya29.GlteBjsABGuNFA4oV4OKmK8S91rZjqdSrEyaHV9BQ0S2SsdNMos9yxiMwYdhxyVAAIxLTSldBoVJQhP6o51YAZ7IiMdTVVemSpwg2PVn1uU2B9juqW4FIIIt0yNh'
        },
      });
    
    
    var mailOption = {
        from: 'najlepsierakety@gmail.com',
        to: 'najlepsierakety@gmail.com',
        subject: `Doobjednavka`,
        text: 'Bola vytvorena objednavka, ale raketa nieje na sklade.',
    };
    
    
    transporter.sendMail(mailOption, (err, res)=>{
        if (err) return console.log('Error with SendEmail.');
        console.log('Email send sucessfully.');
    })
}


module.exports = {reorderRakets}