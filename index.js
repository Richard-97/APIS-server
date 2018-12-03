const express = require("express");

const bodyParser = require('body-parser');
const app = express();
//require('dotenv').config();
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcryptjs');
var pg = require('pg');

const pdf = require('pdfkit');
var fs = require('fs');

pg.defaults.ssl = true;

const user = require('./controllers/user');
const signin = require('./controllers/signin');
const register = require ('./controllers/register');
const invoice = require('./controllers/invoice');
const sendEmail = require('./controllers/sendEmails');
const reorderRakets = require('./controllers/reorderRakets');
const auth = require('./controllers/authorization');
const profile = require('./controllers/profile');
const production = require('./controllers/production');

// Create connection to database
const db = knex({
    client: 'pg',
    version: '9.6',
    connection: {
    host : 'apispostgresql.postgres.database.azure.com',
    user : 'is200it@apispostgresql',
    password : 'Is12342580',
    database : 'postgres'
  }
});

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("APIS ZADANIE")
});
//****************************
//USERS
////**************************
app.post('/signin', signin.signinAuthentification(db, bcrypt))
app.post('/register', (req, res) => {register.registerUser(req, res, db, bcrypt)});
app.get('/profile/:id', auth.requireAuth, (req, res) => {profile.handleProfileGet(req, res, db)})
//****************************
//ORDERS
////**************************
app.post('/tvorba-objednavky', (req, res)=>{
    const {name, email, user_id, city, adress, postal_code, telephone_number, order_name, order_num, price} = req.body;
    var myDoc = new pdf();
    date = new Date;
    
    db('orders').insert({ //TVORBA OBJ.
        name: order_name,
        email,
        status: orderStatus(),
        note: 'uspesna obj.',
        date
    }).returning('id', 'name')
    .then((id)=>{ // TVORBA FAKTURY -> POSLE MAIL
        var invoice_num = user_id.toString()+id;
        invoide_date = date.getDate()+"."+(date.getMonth()+1)+"."+date.getFullYear();
        //invoice.createInvoice(myDoc, name, invoice_num, adress, postal_code, city, email, telephone_number, order_name, order_num, price, invoide_date);
        //sendEmail.sendEmail(invoice_num, email);
        //res.status(200).json('order succesfully added')
        console.log(order_name)
        db.select('*').from('racketOnWarehouse').where('racketName', '=', order_name) //ci je raketa na sklade
        .then((racket)=>{
            console.log(racket)
            if(racket[0].quantity > 0){

                db('racketOnWarehouse').where('racketName', '=', racket[0].racketName).update('quantity',racket[0].quantity-1)
                    .then(res.status(200).json('update sucesfully'))
            }
            else{
                reorderRakets.reorderRakets();
                res.json('Raket is not in warehouse.')
            }
        })
    })
    .catch(console.log)
});   
app.post('/vyroba', (req, res)=>{
    const {racket_name} = req.body;
    if(racket_name == 'Type-1'){
        production(3000);
    }
    else if(racket_name == 'Type-2'){
        production(4000);
    }
    else if(racket_name == 'Type-3'){
        production(6000);
    }
    else{
        res.status(400).json('bad racket name')
    }
    
})
//calendarApi.calendarApi();

const orderStatus = () => {

    const status = {
        spracovanie: false,
        kontrola_materialu: false,
        zaciatok_vyroby: false,
        stred_vyroby: false,
        dokoncovanie_vyroby: false,
        dokoncene: false
    }
    return 'test'
}

//********************************************************************************************* */

  
//********************************************************************************************* */

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`app is running on port ${port}`);
});