const {
  fetchArticleById,
  fetchArticles,
  checkArticleIdExists,
  editArticle, addArticle
} = require("../models/articles.model");
const { checkTopicExists } = require("../models/topics.model");
const {checkUserExists} = require("../models/users.model")

exports.getArticlesById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const { topic, order, sort_by, limit, p } = req.query;
  const promisesArr = [fetchArticles(topic, order, sort_by, limit, p)];
  if (topic) {
    promisesArr.push(checkTopicExists(topic));
  }
  Promise.all(promisesArr)
    .then((resolvedPromises) => {
      const articles = resolvedPromises[0];
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;
  const bodyKeys = Object.keys(body);
  if (!bodyKeys.includes('inc_votes')) {
    res
      .status(400)
      .send({ msg: "Incomplete PATCH request: missing 'inc_votes' property!" });
  } else {
    checkArticleIdExists(article_id)
      .then(() => {
        return editArticle(article_id, body).then((updatedArticle) => {
          res.status(200).send({ updatedArticle });
        });
      })
      .catch((err) => {
        next(err);
      });
  }
};

exports.postArticle = (req, res, next) => {
  const {body} = req
  const bodyKeys = Object.keys(body)
  if (!body.author || !body.body || !body.title || !body.topic){
    res.status(400).send({msg: "Incomplete POST request: one or more required fields missing data"
    })
  }
  else{
    const promisesArr = [checkUserExists(body.author), checkTopicExists(body.topic)]
    Promise.all(promisesArr).then(()=>{
      addArticle(body).then((addedArticle)=>{
        res.status(201).send({addedArticle})
      })
    }).catch(next)
  }
}