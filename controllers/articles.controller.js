const {fetchArticleById, fetchArticles, fetchArticleCommentsByArticleId, checkArticleIdExists} = require("../models/articles.model")

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

exports.getArticleCommentsByArticleId = (req, res, next)=>{
    const {article_id} = req.params
    const promisesArr = [fetchArticleCommentsByArticleId(article_id),
        checkArticleIdExists(article_id)]
    Promise.all(promisesArr)
    .then((resolvedPromises)=>{
        const comments = resolvedPromises[0]
        res.status(200).send({comments})
    })
    .catch(next)
}