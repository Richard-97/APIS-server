var jwt = require('jsonwebtoken');
var redis = require('redis');
//Add your cache name and access key.
var redisClient = redis.createClient(6380, 'redisAPIS.redis.cache.windows.net',
    {auth_pass: 'Fo2XSy4aCmpYZOJUka8O5aSjnBjYsN7Z41HPEA63rds=', tls: {servername: 'redisAPIS.redis.cache.windows.net'}}); 



const handleSignin = (db, bcrypt, req, res) => {
    const {email, password, isEmployee} = req.body;
    if(!email || !password){
        Promise.reject('inncorect form submission');
    }
    return db.select('email', 'password').from('login')
    .where('email', '=', email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].password);
        if(isValid){
            if(isEmployee){
                console.log()
                return db.select('*').from('employees')
                    .where('email', '=', email)
                    .then(user => user[0])
                    .catch(err => Promise.reject('unable to get user'))
                } 
            else{
                return db.select('*').from('customers')
                .where('email', '=', email)
                .then(user => user[0])
                .catch(err => Promise.reject('unable to get user'))
            } 
        }
        else {
            Promise.reject('Wrong credentials')
        }
            
    })
    .catch(err => Promise.reject('2 wrong credentials'))
  }
  
const getAuthTokenId = (req, res) => {
    const { authorization } = req.headers;
    console.log("author", authorization)
    return redisClient.get(authorization, (err, reply) => {
        if(err || !reply) {
            console.log(err, reply)
            return res.status(400).json('Unauthorized');
        }
        return res.json({id: reply});
    })
}

const signToken = (email) => {
    const jwtPayload = { email };
    return jwt.sign(jwtPayload, 'JWT_SECRET', { expiresIn: '2 days'});
}

const setToken = (key, value) => {
    console.log("dsafdsaf", key, value)
    return Promise.resolve(redisClient.set(key, value))
}

const createSession = (user) => {
    const {email, id} = user;
    const role = user.role;
    const token = signToken(email);
    return setToken(token, `${id}_${role}`)
        .then(() => {
            return {user: user, success: 'true', userId: id, token }
        })
        .catch(console.log)
}

const signinAuthentification = (db, bcrypt) => (req, res) => {
    const { authorization } = req.headers;
    return authorization ?
        getAuthTokenId(req, res) :
        handleSignin(db, bcrypt, req, res)
        .then(data => {
            console.log("sign", data)
            return data && data.id && data.email ? createSession(data) : Promise.reject(data)
        })
        .then(session => res.json(session))
        .catch(err => res.status(400).json(err))
}

module.exports = {signinAuthentification, redisClient}