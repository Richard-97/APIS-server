const redisClient = require('./signin').redisClient;

const registerUser = (req, res, db, bcrypt) => {
    const { email, name, password, role, isEmployee, telephone_number, postal_code, city, adress } = req.body;
    console.log(req.body)
    if(!email || !password){
		return res.status(400).json("incorrect form submission")
	}
	const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
		trx.insert({
			password: hash,
            email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
            console.log(loginEmail)
            if(isEmployee) {
                return trx('employees')
                .returning('*')
                .insert({
                    email: loginEmail[0],
                    name: name,
                    role: role,
                    telephone_number: telephone_number,
                    postal_code: postal_code,
                    city: city,
                    adress: adress
                })
                .then(user => res.json(user[0]))
                .catch(err => res.status(400).json('unable to get employee'))
            }
            else {
                return trx('customers')
                .returning('*')
                .insert({
                    email: loginEmail[0],
                    name: name,
                    role: 'customer',
                    telephone_number: telephone_number,
                    postal_code: postal_code,
                    city: city,
                    adress: adress
                })
                .then(user => res.json(user[0]))
                .catch(err => res.status(400).json('unable to get customer'))
            }	
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('unable to get user'))

  }
  module.exports = {registerUser}