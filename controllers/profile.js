
const handleProfileGet = (req, res, db) => {
    const {id} = req.params;
    console.log("id", id)
    let field = id.split('_');
    let id2 = field[0];
    let role = field[1];
    console.log(id2, role)

    if(role == 'customer'){
        return db.select('*').from('customers')
                    .where('id', '=', id2)
                    .then(user => res.json(user[0]))
                    .catch(err => Promise.reject('unable to get user'))
    }
    else{
        return db.select('*').from('employees')
                    .where('id', '=', id2)
                    .then(user => res.json(user[0]))
                    .catch(err => Promise.reject('unable to get user'))
    }
}

module.exports = { handleProfileGet }