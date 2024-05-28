const db = require('../db/connection')

exports.fetchTopics = ()=>{

    return db.query("SELECT slug, description FROM topics")
    .then(({rows})=>{
        if(rows.length ===0){
            return Promise.reject({status: 400, msg:"No topics found!"})
        }
        return rows
    })
}