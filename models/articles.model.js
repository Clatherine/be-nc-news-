const db = require('../db/connection')
const fs = require('fs/promises')
const format = require("pg-format")
const { checkTopicExists } = require('./topics.model')


exports.fetchArticleById = (article_id)=>{
    return db.query("SELECT author, title, article_id, body, topic, created_at, votes, article_img_url FROM articles WHERE article_id = $1", [article_id])
    .then(({rows})=>{
        if(rows.length === 0){
            return Promise.reject({status: 404, msg:"No articles with that id!"})
        }
        return rows[0]
    })
}

exports.fetchArticles = (topic)=>{
let queryStr = "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, article_img_url , COUNT(comments.comment_id):: INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id "

const queryArr =[]

if(topic){
   queryStr +="WHERE topic = $1 "
    queryArr.push(topic)
    
}

queryStr += "GROUP BY articles.article_id ORDER BY created_at DESC"

    return db.query(queryStr, queryArr)
    .then(({rows})=>{
        return rows
    })
}

exports.checkArticleIdExists = (article_id)=>{
    return db.query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({rows})=>{
        if(rows.length ===0){
            return Promise.reject({status: 404, msg:"That article does not exist!"})
            }
    
    })
}

exports.editArticle = (article_id, body)=>{
    return db.query("SELECT votes FROM articles WHERE article_id = $1", [article_id]).then(({rows})=>{
      const currentVotes = rows[0].votes 
      const increment = body.inc_votes
      const updatedVotes = currentVotes + increment
      if(updatedVotes<0){
        return Promise.reject({status: 400, msg:'We\'re not popular enough to subtract that amount!'})
      }
      else {
      return db.query("UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *", [updatedVotes, article_id])
    .then(({rows})=>{
            return rows[0]
    })
}
}
    )
}
