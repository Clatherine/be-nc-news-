const {fetchArticleCommentsByArticleId, addComment, removeComment, checkCommentIdExists, editComment} = require("../models/comments.model")
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
    else{
     const promisesArr = [checkUserExists(username), checkArticleIdExists(article_id)]
    Promise.all(promisesArr).then(()=>{
        addComment(body, article_id).then((addedComment)=>{
            res.status(201).send({addedComment})
        })
        })
    .catch(next)}
}

exports.deleteComment = (req,res,next)=>{
    const {comment_id} = req.params
    removeComment(comment_id)
    .then(()=>{
        res.status(204).end()
    })
    .catch(next)
  
}

exports.patchComment = (req,res,next)=>{
    const {body} = req
    const {comment_id} = req.params
    const bodyKeys = Object.keys(body)
    if (!bodyKeys.includes('inc_votes')) {
        res
          .status(400)
          .send({ msg: "Incomplete PATCH request: missing 'inc_votes' property!" });
      }
      else{
        checkCommentIdExists(comment_id)
        .then(() => {
          return editComment(comment_id, body).then((updatedComment) => {
            res.status(200).send({ updatedComment });
          });
        })
        .catch((err) => {
          next(err);
        });
      }
}