const db = require('../db/connection')
const fs = require('fs/promises')

exports.fetchTopics = ()=>{

    return db.query("SELECT slug, description FROM topics")
    .then(({rows})=>{
        if(rows.length ===0){
            return Promise.reject({status: 400, msg:"No topics found!"})
        }
        return rows
    })
}

exports.fetchEndpoints = ()=>{
return fs.readFile('endpoints.json', 'utf-8')
.then((fileContents)=>{
    const parsedFileContents = JSON.parse(fileContents)
delete parsedFileContents['GET /api']
    return parsedFileContents
})
}