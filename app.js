const express = require('express')
const {getTopics}  = require("./controllers/topics.controller")
const {getEndpoints} = require("./controllers/endpoints.controller")
const {getArticlesById, getArticles, patchArticle, postArticle} = require("./controllers/articles.controller")
const {getArticleCommentsByArticleId, postComment, deleteComment, patchComment} = require("./controllers/comments.controller")
const {getUsers, getUserByUsername} = require("./controllers/users.controller")
const cors = require('cors');

const app = express()
app.use(cors());
app.use(express.json())

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticlesById)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getArticleCommentsByArticleId)

app.post('/api/articles/:article_id/comments', postComment)

app.patch('/api/articles/:article_id', patchArticle)

app.delete('/api/comments/:comment_id', deleteComment)

app.get('/api/users', getUsers)

app.get('/api/users/:username', getUserByUsername)

app.patch('/api/comments/:comment_id', patchComment)

app.post('/api/articles', postArticle)

app.all("*", (req,res)=>{
    res.status(404).send({msg: "Route not found"})
})

app.use((err, req, res, next)=>{
    if(err.status && err.msg){
        res.status(err.status).send({msg: err.msg})
    }
    else(next(err))
})


app.use((err,req,res,next)=>{
    if(err.code === '22P02'){
        res.status(400).send({msg: "Invalid input: expected a number"})
    }
    else(next(err))
})

app.use((err, req, res, next)=>{
  res.status(500).send({msg: 'internal server error'})
})



module.exports = app