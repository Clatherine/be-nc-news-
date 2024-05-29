const {fetchArticleById, fetchArticles, checkArticleIdExists, editArticle} = require("../models/articles.model")

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

exports.patchArticle = (req,res,next)=>{
    const {article_id} = req.params
    const {body} = req

    if (!body.inc_votes){
        res.status(400).send({msg: "Incomplete PATCH request: missing 'inc_votes' property!"
        })
      }
      const bodyKeys = Object.keys(body)
      if (bodyKeys.length !== 1){
          res.status(400).send({msg: "Unexpected properties on request body"})
      }
    checkArticleIdExists(article_id)
    .then(()=>{
    return editArticle(article_id, body)
    .then((updatedArticle)=>{
        res.status(200).send({updatedArticle})
    })})
    .catch((err)=>{
        next(err)
})
}
