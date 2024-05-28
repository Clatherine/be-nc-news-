const {fetchTopics, fetchArticleById, fetchArticles} = require("../models/topics.model")
const endpoints = require("../endpoints.json")

exports.getTopics = (req, res, next) =>{
    fetchTopics().then((topics) =>{
        res.status(200).send({topics})
    }).catch((err)=>{
        next(err)
    })
}

exports.getEndpoints = (req, res, next) =>{
    delete endpoints['GET /api']
    res.status(200).send({endpoints})
}

exports.getArticlesById = (req, res, next) =>{
    const {article_id} = req.params
    fetchArticleById(article_id).then((article) =>{res.status(200).send({article})
    }).catch((err)=>{
        next(err)
    })
}

exports.getArticles = (req, res, next)=>{
fetchArticles().then((articles)=>{
    res.status(200).send({articles})
}).catch((err)=>{
    next(err)
})
}