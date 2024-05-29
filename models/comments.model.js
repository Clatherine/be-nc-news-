const db = require('../db/connection')
const fs = require('fs/promises')
const format = require("pg-format")

exports.fetchArticleCommentsByArticleId = (article_id)=>{
    return db.query("SELECT comment_id, votes, created_at, author, body,article_id FROM comments WHERE article_id = $1 ORDER BY created_at DESC", [article_id])
    .then(({rows})=>{
        return rows
    })
}

exports.addComment = (comment, article_id)=>{
    const valuesArr = [[comment.body, article_id, comment.username]]
    const formattedQuery = format("INSERT INTO comments (body, article_id, author) VALUES %L RETURNING *", valuesArr)
    return db.query(formattedQuery)
    .then(({rows})=>{
        return rows[0]
    })

}