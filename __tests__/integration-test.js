const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data/index.js");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => db.end());

describe("Invalid paths", () => {
  test("status 404: returns 'Route not found' when path contains invalid path", () => {
    return request(app)
      .get("/api/invalid_path")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
});

describe("GET /api/topics", () => {
  test("200 status code: returns array of all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            description: expect.any(String),
            slug: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api", () => {
  test("200 status: returns object containing a key-value pair for all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const values = Object.values(body.endpoints);
        values.forEach((value) => {
          expect(value).toMatchObject({
            description: expect.any(String),
            queries: expect.any(Object),
            exampleResponse: expect.any(Object),
          });
        });
        const regEx = /\/api/;
        const keys = Object.keys(body.endpoints);
        keys.forEach((key) => {
          expect(regEx.test(key)).toBe(true);
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200 status code: responds with an article object corresponding to the article_id provided", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 1,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("404 status code: No articles with that id! when passed an id that does not match any article in database", () => {
    return request(app)
      .get("/api/articles/1000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No articles with that id!");
      });
  });
  test("400 status code: Bad Request when passed an id that is not a number", () => {
    return request(app)
      .get("/api/articles/one")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input");
      });
  });
});

describe("GET /api/articles", () => {
  test("200 status code: responds with an array of all articles, sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(13);
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
          expect(article).not.toHaveProperty("body");
        });
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200 status code: responds with an array of comments for the given article_id, ordered by created_at in descending order", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
        expect(body.comments).toBeSortedBy("created_at", {
            descending: true
        })
      });
  });
  test("404 status code: 'No comments found!' if passed an id that has no associated comments", ()=>{
    return request(app)
    .get('/api/articles/2/comments')
    .expect(404)
    .then(({body})=>{
        expect(body.msg).toBe('No comments found!')
    })
  })
  test("404 status code: 'No comments found!' if passed an id that does not exist", ()=>{
    return request(app)
    .get('/api/articles/20/comments')
    .expect(404)
    .then(({body})=>{
    expect(body.msg).toBe('No comments found!')
    //I would like to be able to return a different comment for this scenario to say 'no articles exist with that id', but I'm not sure how to differentiate between this and the scenario above using rejected Promises
  }) 
  })
  test("400 status code: 'Invalid input' if passed an id that is not a number", ()=>{
    return request(app)
    .get('/api/articles/one/comments')
    .expect(400)
    .then(({body})=>{
        expect(body.msg).toBe('Invalid input')
    })
  })
  
});
