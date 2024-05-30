const db = require('../db/connection')
const fs = require('fs/promises')
const format = require("pg-format")


exports.fetchTopics = ()=>{

    return db.query("SELECT slug, description FROM topics")
    .then(({rows})=>{
        if(rows.length ===0){
            return Promise.reject({status: 404, msg:"No topics found!"})
        }
        return rows
    })
}

exports.checkTopicExists = (slug)=>{
    return db.query("SELECT * FROM topics WHERE slug = $1", [slug])
    .then(({rows})=>{
        if(rows.length ===0){
            return Promise.reject({status: 404, msg: "That topic does not exist!"})
        }
    })
}