const db = require('../db/connection')
const fs = require('fs/promises')
const format = require("pg-format")


exports.fetchArticleById = (article_id)=>{
    return db.query("SELECT author, title, article_id, body, topic, created_at, votes, article_img_url FROM articles WHERE article_id = $1", [article_id])
    .then(({rows})=>{
        if(rows.length === 0){
            return Promise.reject({status: 404, msg:"No articles with that id!"})
        }
        return rows[0]
    })
}

exports.fetchArticles = ()=>{
    return db.query("SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, article_img_url , COUNT(comments.comment_id):: INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, article_img_url ORDER BY created_at DESC")
    .then(({rows})=>{
        if(rows.length ===0){
        return Promise.reject({status: 404, msg:"No articles found!"})
        }
        return rows
    })
}

exports.fetchArticleCommentsByArticleId = (article_id)=>{
    return db.query("SELECT comment_id, votes, created_at, author, body,article_id FROM comments WHERE article_id = $1 ORDER BY created_at DESC", [article_id])
    .then(({rows})=>{
        return rows
    })
}

exports.checkArticleIdExists = (article_id)=>{
    return db.query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({rows})=>{
        if(rows.length ===0){
            return Promise.reject({status: 404, msg:"That article_id does not exist!"})
            }
    })
}