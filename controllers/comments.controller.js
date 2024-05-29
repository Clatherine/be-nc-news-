const {fetchArticleCommentsByArticleId, addComment} = require("../models/comments.model")
const{checkArticleIdExists} = require("../models/articles.model")
const{checkUserExists} = require("../models/users.model")

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

exports.postComment = (req, res, next)=>{
    const {body} = req
    const {article_id} = req.params
    const username = body.username
    if (!username || !body.body){
      res.status(400).send({msg: "Incomplete POST request: one or more required fields missing data"
      })
    }

    const bodyKeys = Object.keys(body)
    console.log(bodyKeys.length, 'bodyKeys.length')
    if (bodyKeys.length !== 2){
        res.status(400).send({msg: "Unexpected properties on request body"})
    }
    else{
     const promisesArr = [checkUserExists(username), checkArticleIdExists(article_id)]
    Promise.all(promisesArr).then(()=>{
        addComment(body, article_id).then((addedComment)=>{
            res.status(201).send({addedComment})
        })
        })
    .catch(next)}
}