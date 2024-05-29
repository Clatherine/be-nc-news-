const db = require('../db/connection')
const fs = require('fs/promises')
const format = require("pg-format")

exports.checkUserExists = (username)=>{
    return db.query("SELECT username FROM users WHERE username = $1", [username])
    .then(({rows})=>{
        if (rows.length ===0){
            return Promise.reject({status: 404, msg:"That username does not exist!"})
        }
    })
}