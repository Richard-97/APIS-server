const getUsers = (req, res, db) => {
    const query = 'SELECT * FROM users' 
    db.select('*').from('users')
    .then(user => {
		res.json(user)
    })
    .catch(console.log)
}

module.exports = { getUsers }