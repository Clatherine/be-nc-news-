const {fetchTopics, fetchEndpoints, fetchArticleById} = require("../models/topics.model")

exports.getTopics = (req, res, next) =>{
    fetchTopics().then((topics) =>{
        res.status(200).send({topics})
    }).catch((err)=>{
        next(err)
    })
}

exports.getEndpoints = (req, res, next) =>{
    fetchEndpoints().then((endpoints)=>{
        res.status(200).json({endpoints})
    }).catch((err)=>{
        next(err)
    })
}

exports.getArticlesById = (req, res, next) =>{
    const {article_id} = req.params
    console.log(article_id)
    fetchArticleById(article_id).then((article) =>{
        res.status(200).send({article})
    }).catch((err)=>{
        console.log('enterring err block in controller')
        console.log(err, 'err in controller')
        next(err)
    })
}