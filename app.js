const express = require('express')
const {getTopics, getEndpoints, getArticlesById, getArticles} = require("./controllers/topics.controller")

const app = express()

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticlesById)

app.get('/api/articles', getArticles)

app.use((err, req, res, next)=>{
    if(err.status && err.msg){
        res.status(err.status).send({msg: err.msg})
    }
    else(next(err))
})

app.use((err, req, res, next)=>{
    if (err.code){
        res.status(400).send({msg: "Invalid input"})
    }
})

app.all("*", (req,res)=>{
    res.status(404).send({msg: "Route not found"})
})

module.exports = app