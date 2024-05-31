const db = require('../db/connection')
const fs = require('fs/promises')

exports.checkUserExists = (username)=>{
    return db.query("SELECT username FROM users WHERE username = $1", [username])
    .then(({rows})=>{
        if (rows.length ===0){
            return Promise.reject({status: 404, msg:"That username/author does not exist!"})
        }
    })
}

exports.fetchUsers = () =>{
    return db.query("SELECT * FROM users")
    .then(({rows})=>{
        return rows
    })
}

exports.fetchUserByUsername = (username)=>{
    return db.query("SELECT * FROM users WHERE username = $1", [username])
    .then(({rows})=>{
        return rows[0]
    })

}