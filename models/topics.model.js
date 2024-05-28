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

exports.fetchEndpoints = ()=>{
return fs.readFile('endpoints.json', 'utf-8')
.then((fileContents)=>{
    const parsedFileContents = JSON.parse(fileContents)
delete parsedFileContents['GET /api']
    return parsedFileContents
})
}

exports.fetchArticleById = (article_id)=>{
    return db.query("SELECT author, title, article_id, body, topic, created_at, votes, article_img_url FROM articles WHERE article_id = $1", [article_id])
    .then(({rows})=>{
        console.log(rows, 'rows')
        if(rows.length === 0){
            console.log('entering this block')
            return Promise.reject({status: 404, msg:"No articles with that id!"})
        }
        return rows
    })

}