
const express = require("express");

const bodyParser = require('body-parser');
const app = express();
//require('dotenv').config();
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcryptjs');
var pg = require('pg');
const fetch = require("node-fetch");
const axios = require('axios');


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
app.post('/make-order', async (req, res) => {
    const { id_user,name,email, city, adress, postal_code, telephone_number, note, type, racketFrameTechnology,racketHeadSizeType,racketGridType } = req.body;
    var myDoc = new pdf();
    date = new Date;
    if(id_user){
        const user = await db('customers').where('id','=', id_user);
        if(type){
            const order = await db('orders').insert({
                name: type,
                email: user[0].email,
                status: 'Nezaplatená',
                note: 'obj',
                date
            }).returning('id')
            
            const price = await db('racketOnWarehouse').where('racketName', '=', type)
            new_data = ((date.getDate()).toString() +'.'+(date.getMonth()+1).toString()+'.'+(date.getFullYear()).toString())

            invoice.createInvoice(myDoc, user[0].name, order[0], user[0].adress, user[0].postal_code, user[0].city, user[0].email,user[0].telephone_number, type, order[0], price[0].price, new_data);
            sendEmail.sendEmail(order[0], user[0].email)
            res.status(200).json('ok')
        }
        else{
            const ownRacket = await db('ownRacket').insert({
                racketFrame: racketFrameTechnology,
                racketGrip: racketGridType,
                racketHead: racketHeadSizeType,
                email: user[0].email
            }).returning('order_id')
            const order = await db('orders').insert({
                name: `Vlastná raketa-${ownRacket[0]}`,
                email: user[0].email,
                status: 'Nezaplatená',
                note: 'obj',
                date
            }).returning('id')
            console.log(order)
            let frame_price = await db('racketFrame').where('technology', '=', racketFrameTechnology).returning('price');
            let grip_price = await db('racketGrip').where('type', '=', racketGridType).returning('price');
            let head_price = await db('racketHeadSize').where('type', '=', racketHeadSizeType).returning('price');
            console.log(frame_price[0].price)
            const final_price = frame_price[0].price + grip_price[0].price + head_price[0].price
            new_data = ((date.getDate()).toString() +'.'+(date.getMonth()+1).toString()+'.'+(date.getFullYear()).toString())

            invoice.createInvoice(myDoc, user[0].name, order[0], user[0].adress, user[0].postal_code,user[0].city, user[0].email, user[0].telephone_number, `Vlastná raketa-${ownRacket[0]}`, order[0].name, final_price, new_data);
            sendEmail.sendEmail(order[0], user[0].email)
            res.json('ok')
        }
    }
    else{
        if(type){
            const order = await db('orders').insert({
                name: type,
                email,
                status: 'Nezaplatená',
                note: 'neregistrovany',
                date
            }).returning('id');
            const unregistered_data = await db('unregistered').insert({
                name,
                email,
                city,
                adress,
                postal_code,
                telephone_number,
                note,
                type,
                order_id: parseInt(order)
            })
            new_data = ((date.getDate()).toString() +'.'+(date.getMonth()+1).toString()+'.'+(date.getFullYear()).toString())
            const price = await db('racketOnWarehouse').where('racketName', '=', type)
            invoice.createInvoice(myDoc, name, order[0], adress, postal_code, city, email, telephone_number, type, order[0], price[0].price, new_data);
            sendEmail.sendEmail(order[0], email)
            res.json('ok')
        }
        else{
            const ownRacket = await db('ownRacket').insert({
                racketFrame: racketFrameTechnology,
                racketGrip: racketGridType,
                racketHead: racketHeadSizeType,
                email
            }).returning('order_id')
            const order = await db('orders').insert({
                name: `Vlastná raketa-${ownRacket[0]}`,
                email,
                status: 'Nezaplatená',
                note: 'obj',
                date
            }).returning('*')
            console.log(order[0].id)
            let frame_price = await db('racketFrame').where('technology', '=', racketFrameTechnology).returning('price');
            let grip_price = await db('racketGrip').where('type', '=', racketGridType).returning('price');
            let head_price = await db('racketHeadSize').where('type', '=', racketHeadSizeType).returning('price');
            const final_price = frame_price[0].price + grip_price[0].price + head_price[0].price
            new_data = ((date.getDate()).toString() +'.'+(date.getMonth()+1).toString()+'.'+(date.getFullYear()).toString())
            invoice.createInvoice(myDoc, name, order[0].id, adress, postal_code, city, email, telephone_number, `Vlastná raketa-${ownRacket[0]}`, order[0].name, final_price, new_data);
            sendEmail.sendEmail(order[0].id, email)
            res.json('ok')
        }
    }
});   

app.get('/racket-on-warehouser/:id', (req, res) => {
    const { id } = req.params;
    console.log(id)
    db.select('quantity').from('racketOnWarehouse')
    .where('ID_racket', '=', id)
    .then( data => res.json(data))
    .catch(err => res.status(400).json('unable to get quantity'))
})


app.get('/calculate-weight-price/:racketFrameTechnology/:racketGridType/:racketHeadSizeType', async (req, res) => {
    const { racketFrameTechnology, racketGridType, racketHeadSizeType } = req.params;
    const racketFrame = await db('racketFrame').where('technology', '=', racketFrameTechnology);
    const racketGrip = await db('racketGrip').where('type', '=', racketGridType);
    const racketHead = await db('racketHeadSize').where('type', '=', racketHeadSizeType);

    let final_price = racketFrame[0].price + racketGrip[0].price + racketHead[0].price;

    const racketObjFrame = racketFrame[0];
        delete racketObjFrame["ID_frame"];
        delete racketObjFrame["price"];
        delete racketObjFrame["technology"];
    const racketObjGrip = racketGrip[0];
        delete racketObjGrip["ID_grip"]
        delete racketObjGrip["price"]
        delete racketObjGrip["type"]
    const racketObjHead = racketHead[0];
        delete racketObjHead["ID_head"]
        delete racketObjHead["price"]
        delete racketObjHead["type"]


    let weight_frame = 0;
    let weight_grip = 0;
    let weight_head = 0;
    for(var i in racketObjFrame){
        if(racketObjFrame[i] !== 0){
            const racketMaterial = await db('racketMaterial').where('type', '=', i);
            weight_frame = weight_frame + (racketObjFrame[i]*racketMaterial[0].weight)
            console.log('frame:',weight_frame)
        }
    }
    for(var j in racketObjGrip){
        if(racketObjGrip[j] !== 0){
            const racketMaterial = await db('racketMaterial').where('type', '=', j);
            weight_grip = weight_grip + (racketObjGrip[j]*racketMaterial[0].weight)
            console.log('grip:',weight_grip)
        }
    }

    for(var j in racketObjHead){
        if(racketObjHead[j] !== 0){
            const racketMaterial = await db('racketMaterial').where('type', '=', j);
            weight_head = weight_head + (racketObjHead[j]*racketMaterial[0].weight)
            console.log('head:',weight_head)
        }
    }

    let final_weight = weight_frame + weight_grip + weight_head;
    if(final_price !== 0 && final_weight !== 0){
        res.status(200).json({
            final_weight,
            final_price
        })
    }
    else{
        res.status(400).json('enable to make price')
    }
    
})

app.get('/orders', (req, res) => {
    db.select('*').from('orders').orderBy('id', 'desc')
    .then( data => res.json(data))
    .catch(err => res.status(400).json('unable to get orders'))
})

app.get('/orders-in-production', async (req, res) => {
    const orders = await db.select('*').from('orders')
                                                    .orWhere('status', 'Začiatok výroby')
                                                    .orWhere('status', 'Výroba rámu')
                                                    .orWhere('status', 'Nasadenie gripu')
                                                    .orWhere('status', 'Nasadenie výpletu')
                                                    .orWhere('status', 'Testovanie kvality')
                                                    .orWhere('status', 'Koniec výroby').orderBy('id', 'desc')

    if(orders) res.status(200).json(orders)
    else res.status(400).json('nonaccepted')
})

app.post('/find-order', (req, res) => {
    const { order_id, email } = req.body;
    db.select('*').from('orders')
    .where( 'id', '=', order_id, 'AND', 'email', '=', email)
    .then( data => res.json(data))
    .catch(err => res.status(400).json('unable to get order'))
})

app.get('/orders/:email', async (req, res) => {
    console.log(req.params)
    const { email } = req.params;
    const orders = await db.select('*').from('orders').where('email', '=', email).orderBy('id', 'desc')
    res.status(200).json(orders)
})

app.post('/payment', async (req, res) => {
    const { order_id } = req.body;
    db('orders').where('id', '=', order_id).update('status', 'Zaplatená')
    .then((i, err)=>{
        if(!err){
            res.status(200).json('accepted')
        }
        else{
            res.status(400).json('nonaccepted')
        }
    });
})

app.get('/materials', (req, res) => {
    db.select('*').from('racketMaterial').orderBy('ID_material', 'desc')
    .then( data => res.json(data))
    .catch(err => res.status(400).json('unable to get material'))
})

app.get('/employees', (req, res) => {
    db.select('*').from('employees')
    .then( data => res.json(data))
    .catch(err => res.status(400).json('unable to get employees'))
})

app.post('/startProductionByManager', async (req, res) => {
    const { order_id } = req.body;
    const order = await db('orders').where('id', '=', order_id);
    console.log(order[0].status)
    if(order[0].status === 'Nezaplatená'){
        res.status(400).json('nonaccepted')
    }
    else if(order[0].status === 'Zaplatená'){
        const accepted = await db('orders').where('id', '=', order_id).update('status', 'Výroba odsúhlasená Manažérom');
        res.status(200).json("accepted");
    }
    else{
        res.status(400).json('nonaccepted-bad order status')
    }
})

app.get('/getMaterialOfNameRacket/:racket_name', async (req, res) => {
    const { racket_name } = req.params;
    let frame = []
    let grip = []
    let head = []

    if(racket_name.includes('Type')){
        const racket = await db('racketOnWarehouse').where('racketName', '=', racket_name)

        const racketFrameType = await db('racketFrame').where('technology', '=', racket[0].frameType);
        const racketGripType = await db('racketGrip').where('type', '=', racket[0].gripType);
        const racketHeadType = await db('racketHeadSize').where('type', '=', racket[0].headType);

        const racketObjFrame = racketFrameType[0];
        delete racketObjFrame["ID_frame"];
        delete racketObjFrame["price"];
        delete racketObjFrame["technology"];

        const racketObjGrip = racketGripType[0];
        delete racketObjGrip["ID_grip"]
        delete racketObjGrip["price"]
        delete racketObjGrip["type"]

        const racketObjHead = racketHeadType[0];
        delete racketObjHead["ID_head"]
        delete racketObjHead["price"]
        delete racketObjHead["type"]

        for(let i in racketObjFrame){
            if(racketObjFrame[i] !== 0){
                frame.push({[i]: racketObjFrame[i]})
            }
        }
        for(let i in racketObjGrip){
            if(racketObjGrip[i] !== 0){
                grip.push({[i]: racketObjGrip[i]})
            }
        }
        for(let i in racketObjHead){
            if(racketObjHead[i] !== 0){
                head.push({[i]: racketObjHead[i]})
            }
        }
        if(frame.length === 1){
            frame = {...frame[0]}
        }
        else if(frame.length === 2){
            frame = {...frame[0], ...frame[1]}
        }
        
        grip = {...grip[0]}
        head = {...head[0]}

        res.status(200).json({
            frame,
            grip,
            head
        })
        console.log(frame, grip, head)
    }
    else{
        let order_num = racket_name.split('-');
        console.log(order_num)
        const racket = await db('ownRacket').where('order_id', '=', order_num[1])
        console.log(racket)

        const racketFrameType = await db('racketFrame').where('technology', '=', racket[0].racketFrame);
        const racketGripType = await db('racketGrip').where('type', '=', racket[0].racketGrip);
        const racketHeadType = await db('racketHeadSize').where('type', '=', racket[0].racketHead);

        const racketObjFrame = racketFrameType[0];
        delete racketObjFrame["ID_frame"];
        delete racketObjFrame["price"];
        delete racketObjFrame["technology"];

        const racketObjGrip = racketGripType[0];
        delete racketObjGrip["ID_grip"]
        delete racketObjGrip["price"]
        delete racketObjGrip["type"]

        const racketObjHead = racketHeadType[0];
        delete racketObjHead["ID_head"]
        delete racketObjHead["price"]
        delete racketObjHead["type"]

        
        for(let i in racketObjFrame){
            if(racketObjFrame[i] !== 0){
                frame.push({[i]: racketObjFrame[i]})
            }
        }
        for(let i in racketObjGrip){
            if(racketObjGrip[i] !== 0){
                grip.push({[i]: racketObjGrip[i]})
            }
        }
        for(let i in racketObjHead){
            if(racketObjHead[i] !== 0){
                head.push({[i]: racketObjHead[i]})
            }
        }
        if(frame.length === 1){
            frame = {...frame[0]}
        }
        else if(frame.length === 2){
            frame = {...frame[0], ...frame[1]}
        }
        
        grip = {...grip[0]}
        head = {...head[0]}
       
        res.status(200).json({
            frame: frame,
            grip: grip,
            head: head
        })
    }

})
app.post('/orderMaterial', async (req, res) => {
    const { ID_material, amount }  = req.body;
 
    const material = await db('racketMaterial').where('ID_material', '=', ID_material);
    db('racketMaterial').where('ID_material', '=', ID_material).update('amount', material[0].amount+amount);
    res.status(200).json('accepted')

})

app.post('/startProductionByProductionWorker', async (req, res) => {
    const { order_id } = req.body;
    const order = await db('orders').where('id', '=', order_id);
    console.log(order[0].name)

    if(order[0].status==='Výroba odsúhlasená Manažérom'){
        let frame = []
        let grip = []
        let head = []
        if(order[0].name.includes('Type')){
            const racket = await db('racketOnWarehouse').where('racketName', '=', order[0].name)
    
            const racketFrameType = await db('racketFrame').where('technology', '=', racket[0].frameType);
            const racketGripType = await db('racketGrip').where('type', '=', racket[0].gripType);
            const racketHeadType = await db('racketHeadSize').where('type', '=', racket[0].headType);
    
            const racketObjFrame = racketFrameType[0];
            delete racketObjFrame["ID_frame"];
            delete racketObjFrame["price"];
            delete racketObjFrame["technology"];
    
            const racketObjGrip = racketGripType[0];
            delete racketObjGrip["ID_grip"]
            delete racketObjGrip["price"]
            delete racketObjGrip["type"]
    
            const racketObjHead = racketHeadType[0];
            delete racketObjHead["ID_head"]
            delete racketObjHead["price"]
            delete racketObjHead["type"]
    
            for(let i in racketObjFrame){
                if(racketObjFrame[i] !== 0){
                    frame.push({[i]: racketObjFrame[i]})
                }
            }
            for(let i in racketObjGrip){
                if(racketObjGrip[i] !== 0){
                    grip.push({[i]: racketObjGrip[i]})
                }
            }
            for(let i in racketObjHead){
                if(racketObjHead[i] !== 0){
                    head.push({[i]: racketObjHead[i]})
                }
            }
        }
        else{
            let racketName = order[0].name.split('-');
            
            const racket = await db('ownRacket').where('order_id', '=', racketName[1])
            console.log(racket)
    
            const racketFrameType = await db('racketFrame').where('technology', '=', racket[0].racketFrame);
            const racketGripType = await db('racketGrip').where('type', '=', racket[0].racketGrip);
            const racketHeadType = await db('racketHeadSize').where('type', '=', racket[0].racketHead);
    
            const racketObjFrame = racketFrameType[0];
            delete racketObjFrame["ID_frame"];
            delete racketObjFrame["price"];
            delete racketObjFrame["technology"];
    
            const racketObjGrip = racketGripType[0];
            delete racketObjGrip["ID_grip"]
            delete racketObjGrip["price"]
            delete racketObjGrip["type"]
    
            const racketObjHead = racketHeadType[0];
            delete racketObjHead["ID_head"]
            delete racketObjHead["price"]
            delete racketObjHead["type"]
    
            
            for(let i in racketObjFrame){
                if(racketObjFrame[i] !== 0){
                    frame.push({[i]: racketObjFrame[i]})
                }
            }
            for(let i in racketObjGrip){
                if(racketObjGrip[i] !== 0){
                    grip.push({[i]: racketObjGrip[i]})
                }
            }
            for(let i in racketObjHead){
                if(racketObjHead[i] !== 0){
                    head.push({[i]: racketObjHead[i]})
                }
            }
        }
        let materials = frame.concat(grip)
        let materials2 = materials.concat(head)

        let keys = []
        let values = []
        let material_enought = false;
        for(let i of materials2){
            keys.push(Object.keys(i)[0])
            values.push(Object.values(i)[0])
        }
        for(let i=0; i<keys.length; i++){
            const mat = await db('racketMaterial').where('type', '=', keys[i])
            console.log(mat)
            if(mat[0].amount<values[i]){
                break
            }
            if(i === keys.length-1){
                material_enought = true;
            }   
        }

        const isOnWarehouse = await db('racketOnWarehouse').where('racketName', '=', order[0].name)
        console.log(isOnWarehouse)
        if( isOnWarehouse.length !== 0 ){
            if(isOnWarehouse[0].quantity > 0){
                const racketBought =await db('racketOnWarehouse').where('racketName', '=', order[0].name).update('quantity', (isOnWarehouse[0].quantity-1))
                const sendOrder = await db('orders').where('id', '=', order_id).update('status','Objednávka odoslaná')
                res.status(200).json('accepted')
            }
            else{
                        if(material_enought){
                            for(let i=0; i<keys.length; i++){
                                const matr = await db('racketMaterial').where('type', '=', keys[i])
                                let new_amount = matr[0].amount - values[i]
                                console.log(matr[0].amount)
                                console.log(new_amount)
                                const mat = await db('racketMaterial').where('type', '=', keys[i]).update('amount', new_amount)
                            }
                        db('orders').where('id', '=', order_id).update('status', 'Začiatok výroby')
                        .then(()=>{ 
                            //'https://apis-server-production.eu-gb.mybluemix.net/startProduction'
                            fetch('https://apis-server-production.eu-gb.mybluemix.net/startProduction', {
                                method: 'post',
                                headers: {
                                    'Content-type': 'application/json'
                                },
                                body: JSON.stringify({
                                    order_id
                                })
                            })
                            .then(data=>data.json())
                            .then(data => {
                                console.log(data)
                                if(data === 'fail'){
                                    //axios.post('http://localhost:3000/startProductionByProductionWorker', {order_id})
                                }
                            })
                            .then(
                                res.status(200).json('accepted')
                            ).catch(console.log)
                            //axios.post('http://localhost:4000/startProduction', {order_id})
                            //res.status(200).json('accepteddd')
                        })
                    }
                    else{
                        res.status(400).json('Nedostatok materialu')
                    }
            }
        }
        else{
            console.log('aaa')
            if(material_enought){
                for(let i=0; i<keys.length; i++){
                    const matr = await db('racketMaterial').where('type', '=', keys[i])
                    let new_amount = matr[0].amount - values[i]
                    console.log(matr[0].amount)
                    console.log(new_amount)
                    const mat = await db('racketMaterial').where('type', '=', keys[i]).update('amount', new_amount)
                }
                db('orders').where('id', '=', order_id).update('status', 'Začiatok výroby')
                .then(()=>{ 
                    //'https://apis-server-production.eu-gb.mybluemix.net/startProduction'
                    fetch('https://apis-server-production.eu-gb.mybluemix.net/startProduction', {
                        method: 'post',
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            order_id
                        })
                    })
                    .then(data=>data.json())
                    .then(data => {
                        console.log(data)
                        if(data === 'fail'){
                            //axios.post('http://localhost:3000/startProductionByProductionWorker', {order_id})
                        }
                    })
                    .then(
                        res.status(200).json('accepted')
                    ).catch(console.log)
                    //axios.post('http://localhost:4000/startProduction', {order_id})
                    //res.status(200).json('accepteddd')
                })
            }
            else{
                res.status(400).json('Nedostatok materialu')
            }
        }
    }
    else{
        res.status(400).json('nonaccepted')
    }
})

app.get('/racket-warehouse', async (req, res)=>{
    const warehouse = await db('racketOnWarehouse')
    if(warehouse){
        res.status(200).json(warehouse)
    }
    else{
        res.status(400).json('nonaccepted')
    }
})

app.get('/is-production-stopped', (req, res)=>{
    db('stopProduction').where('id', '=', 1)
        .then(data=>{
            console.log(data[0].stop)
            res.status(200).json(data[0].stop)
        })
        .catch(err=>res.status(400).json(err))
})

app.post('/stop-production', async (req, res)=>{
    const {stop} = req.body

    const stopUpdate = await db('stopProduction').where('id', '=', 1).update('stop', stop)
    if(stopUpdate) res.status(200).json('accepted')
    if(stop === 0){
        const orders = await db.select('*').from('orders')
                .orWhere('status', 'Začiatok výroby')
                .orWhere('status', 'Výroba rámu')
                .orWhere('status', 'Nasadenie gripu')
                .orWhere('status', 'Nasadenie výpletu')
                .orWhere('status', 'Testovanie kvality')
                .orWhere('status', 'Koniec výroby')

        console.log(orders)
        for(let i=0; i<orders.length; i++){
            setTimeout(() => {
                fetch('https://apis-server-production.eu-gb.mybluemix.net/startProduction', {
                //fetch('http://localhost:4000/startProduction', {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        order_id: orders[i].id
                    })
                })
            }, 500);
        }
    }
    else{

    }

})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`app is running on port ${port}`);
});