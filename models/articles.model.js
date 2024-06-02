const db = require("../db/connection");
const fs = require("fs/promises");
const { checkTopicExists } = require("./topics.model");
const format = require("pg-format")

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      "SELECT articles.author, articles.title, articles.article_id, articles.body, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comment_id)::INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id",
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "No article with that id!" });
      }
      return rows[0];
    });
};

exports.fetchArticles = (topic, order = "desc", sort_by = "created_at", limit = 10, p = 1) => {
  const permittedOrders = ["asc", "ASC", "desc", "DESC"];
  const permittedSortBys = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];

  if (!permittedSortBys.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "invalid sort_by request" });
  } else if (!permittedOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "invalid order request" });
  } else {
    let queryStr =
      "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, article_img_url , COUNT(comments.comment_id):: INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id ";

    const queryArr = [];
    let dollarCount = 1;

    if (topic) {
      queryStr += `WHERE topic = $${dollarCount} `;
      queryArr.push(topic);
      dollarCount++;
    }
const offset = (p-1)*limit

    queryStr += `GROUP BY articles.article_id ORDER BY ${sort_by} ${order} LIMIT $${dollarCount} OFFSET $${dollarCount+1}`
    queryArr.push(limit)
    queryArr.push(offset)

    return db.query(queryStr, queryArr).then(({ rows }) => {
      return rows;
    });
  }
};

exports.checkArticleIdExists = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "That article does not exist!",
        });
      }
    });
};

exports.editArticle = (article_id, body) => {
  return db
    .query("SELECT votes FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      const currentVotes = rows[0].votes;
      const increment = body.inc_votes;
      const updatedVotes = currentVotes + increment;
      if (updatedVotes < 0) {
        return Promise.reject({
          status: 400,
          msg: `We're not popular enough to subtract that amount! We only have ${currentVotes} votes!`,
        });
      } else {
        return db
          .query(
            "UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *",
            [updatedVotes, article_id]
          )
          .then(({ rows }) => {
            return rows[0];
          });
      }
    });
};

exports.addArticle = (article) =>{
  const valuesArr = [[article.author, article.title, article.body, article.topic]]
 
let queryStr = "INSERT INTO articles (author, title, body, topic"

if (article.article_img_url){
  queryStr +=", article_img_url"
  valuesArr[0].push(article.article_img_url)
}
queryStr += ") VALUES %L RETURNING *"

  const formattedQuery = format(queryStr, valuesArr)
  return db.query(formattedQuery)
  .then(({rows})=>{
const article_id = rows[0].article_id
return db.query(`SELECT articles.author, articles.title, articles.body, articles.topic, articles.article_img_url, articles.article_id, articles.votes, articles.created_at, COUNT(comments.comment_id)::INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`, [article_id]).then(({rows})=>{
  return rows[0]
})  
  })

}