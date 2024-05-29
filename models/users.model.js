const db = require('../db/connection')
const fs = require('fs/promises')
const format = require("pg-format")

exports.checkUserExists = (username)=>{
    console.log('entering checkUserExists model')
    return db.query("SELECT username FROM users WHERE username = $1", [username])
    .then(({rows})=>{
        console.log(rows)
        if (rows.length ===0){
            console.log('this is true')
            return Promise.reject({status: 404, msg:"That username does not exist!"})
        }
    })
}