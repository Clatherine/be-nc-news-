const express = require('express')
const {getTopics, getEndpoints, getArticlesById} = require("./controllers/topics.controller")

const app = express()

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticlesById)

app.use((err, req, res, next)=>{
    console.log('entering next block')
    console.log(err.status, 'error status')
    console.log(err.msg, 'err msg')
    if(err.status && err.msg){
        console.log('enterring next block')
        res.status(err.status).send({msg: err.msg})
    }
    else(next(err))
})

app.use((err, req, res, next)=>{
    if (err.code){
        res.status(400).send({msg: "Bad Request"})
    }
})


app.all("*", (req,res)=>{
    res.status(404).send({msg: "Route not found"})
})

module.exports = app