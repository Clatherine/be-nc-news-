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
  test("404 status code: No article with that id! when passed an id that does not match any article in database", () => {
    return request(app)
      .get("/api/articles/1000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("No article with that id!");
      });
  });
  test("400 status code: Invalid input: expected a number when passed an id that is not a number", () => {
    return request(app)
      .get("/api/articles/one")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input: expected a number");
      });
  });
  test("200 status code: responds with an article object corresponding to the article_id provided that includes a comment_count property with a value equal to the number of comments associated with that article; works when comment_count > 0", () => {
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
          comment_count: 11,
        });
      });
  });
  test("200 status code: responds with an article object corresponding to the article_id provided that includes a comment_count property with a value equal to the number of comments associated with that article; works when comment_count = 0", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 2,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: 0,
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("200 status code: responds with an array of all articles, sorted by date in descending order, limited to first 10 articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
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
  test("200 status code: responds with an array of articles filtered by the topic provided, sorted by date in descending order, when passed a query of 'topic' with a topic that exists and has matching articles, limited to first 10 articles", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
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
      });
  });
  test("200 status code: resolves with an empty array if passed a query of 'topic' with a topic name that exists but has no associated articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(0);
      });
  });
  test("404 status code: resolves with a message of 'That topic does not exist!' if passed a query of 'topic' with a topic that doesn't exist", () => {
    return request(app)
      .get("/api/articles/?topic=plants")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That topic does not exist!");
      });
  });
  test("200 status code: responds with an array of all articles sorted by date in ascending order when passed a query of 'order=asc', limited to first 10 articles", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("created_at");
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
      });
  });
  test("200 status code: responds with an array of all articles sorted by date in ascending order when passed a query of 'order=ASC'", () => {
    return request(app)
      .get("/api/articles?order=ASC")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at");
      });
  });
  test("200 status code: responds with an array of all articles sorted by date in descending order when passed a query of 'order=DESC'", () => {
    return request(app)
      .get("/api/articles?order=DESC")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("400 status code: responds with a message of 'invalid order request' when passed an order value that is not asc, ASC, desc or DESC", () => {
    return request(app)
      .get("/api/articles?order=none")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid order request");
      });
  });
  test("200 status code: responds with an array of all articles sorted by article_id, descending, when passed a 'sort_by' query with value 'article_id', limited to first 10 articles", () => {
    return request(app)
      .get("/api/articles/?sort_by=article_id")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("article_id", { descending: true });
      });
  });
  test("200 status code: responds with an array of all articles sorted by author, descending alphabetically, when passed a 'sort_by' query with value 'author', limited to first 10 articles", () => {
    return request(app)
      .get("/api/articles/?sort_by=author")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("author", { descending: true });
      });
  });
  test("200 status code: responds with an array of all articles sorted by comment_count, descending, when passed a 'sort_by' query with value 'comment_count', limited to first 10 articles", () => {
    return request(app)
      .get("/api/articles/?sort_by=comment_count")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("comment_count", {
          descending: true,
        });
      });
  });
  test("200 status code: responds with an array of all articles sorted by votes, descending, when passed a 'sort_by' query with value 'votes', limited to first 10 articles", () => {
    return request(app)
      .get("/api/articles/?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("votes", { descending: true });
      });
  });
  test("200 status code: responds with an array of all articles sorted by votes, ascending, when passed a 'sort_by' query with value 'votes' AND an 'order' query with value 'asc', limited to first 10 articles", () => {
    return request(app)
      .get("/api/articles/?sort_by=votes&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("votes", { ascending: true });
      });
  });
  test("200 status code: responds with an array of all articles sorted by title, ascending, when passed a 'sort_by' query with value 'title' AND an 'order' query with value 'asc', limited to first 10 articles", () => {
    return request(app)
      .get("/api/articles/?sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("title", { ascending: true });
      });
  });
  test("200 status code: responds with an array of all articles sorted by title, ascending, when passed a 'sort_by' query with value 'article_id' AND an 'order' query with value 'ASC', limited to first 10 articles", () => {
    return request(app)
      .get("/api/articles/?sort_by=article_id&order=ASC")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("article_id", { ascending: true });
      });
  });
  test("400 status code: responds with a message pf 'invalid sort_by request' when passed a sort_by query with an invalid value", () => {
    return request(app)
      .get("/api/articles/?sort_by=popularity")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid sort_by request");
      });
  });
  test("400 status code: responds with a message pf 'invalid sort_by request' when passed a sort_by query with an invalid value AND an invalid order query", () => {
    return request(app)
      .get("/api/articles/?sort_by=popularity&order=down")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid sort_by request");
      });
  });
  test("200 status code: responds with an array of all articles, sorted by date in descending order, limited to first x articles when passed a limit query of x", () => {
    return request(app)
      .get("/api/articles?limit=8")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(8);
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
  test("200 status code: responds with an array of all articles, sorted by date in descending order, when passed a limit query with value greater than the total number of articles in the database", () => {
    return request(app)
      .get("/api/articles?limit=100")
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
  test("400 status code: responds with a message pf 'Invalid input: expected a number' when passed a limit query with a non-number value", () => {
    return request(app)
      .get("/api/articles/?limit=ten")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input: expected a number");
      });
  });
  test("200 status code: responds with an array of the second 10 articles (in this case the last 3 articles, since total 13 in database), sorted by date in descending order, when passed a p query with value 2", () => {
    return request(app)
      .get("/api/articles?p=2")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(3);
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
        expect(body.articles[0]).toEqual({
          author: "icellusedkars",
          title: "Does Mitch predate civilisation?",
          article_id: 8,
          topic: "mitch",
          created_at: "2020-04-17T01:08:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 0,
        });
      });
  });
  test("400 status code: responds with a message pf 'Invalid input: expected a number' when passed a p query with a non-number value", () => {
    return request(app)
      .get("/api/articles/?p=ten")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input: expected a number");
      });
  });
  test("200 status code: responds with an array of 0 articles when passed a p query with value greater than the final page of articles in the database", () => {
    return request(app)
      .get("/api/articles?p=3")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(0);
      });
  });
  test("200 status code: responds with an array of the second 4 articles, sorted by date in descending order, when passed a p query with value 2, and a limit query with value 4", () => {
    return request(app)
      .get("/api/articles?p=2&limit=4")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(4);
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
        expect(body.articles[0]).toEqual({
            author: 'butter_bridge',
            title: 'Another article about Mitch',
            article_id: 13,
            topic: 'mitch',
            created_at: '2020-10-11T11:24:00.000Z',
            votes: 0,
            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
            comment_count: 0
          });
      });
  });
  test("200 status code: responds with an array of 0 articles when passed a p query with value 0", () => {
    return request(app)
      .get("/api/articles?p=0")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(0);
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200 status code: responds with an array of comments for the given article_id, ordered by created_at in descending order, limited to first 10 comments", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(10);
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
          descending: true,
        });
      });
  });
  test("400 status code: 'Invalid input: expected a number' if passed an id that is not a number", () => {
    return request(app)
      .get("/api/articles/one/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input: expected a number");
      });
  });
  test("200 status code: resolves with an empty array if passed an article_id that exists but has no associated comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  test("404 status code: 'That article does not exist!' if passed an id that does not exist", () => {
    return request(app)
      .get("/api/articles/20/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That article does not exist!");
      });
  });
  test("200 status code: responds with an array of comments for the given article_id, ordered by created_at in descending order, limited to first x comments, when passed a query of 'limit=x'", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(5);
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
          descending: true,
        });
      });
  });
  test("200 status code: responds with an array of comments for the given article_id, ordered by created_at in descending order, limited to 2nd 10 comments (or however many are left after first 10), when passed a query of 'p=2'", () => {
    return request(app)
      .get("/api/articles/1/comments?p=2")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(1);
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
          descending: true,
        });
      });
  });
  test("200 status code: responds with an empty array  when passed a query of 'p=x', where the total number of comments for the article_id passed is less than 10*(x-1)", () => {
    return request(app)
      .get("/api/articles/1/comments?p=3")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  test("200 status code: responds with all comments for the passed article_id when passed a limit query >= total number of comments for that article", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=15")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(11);
      });
  });
  test("200 status code: responds with the second x comments for the passed article_id when passed a limit query of x and a p query of 2", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=3&p=2")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(3);
        expect(body.comments[0]).toEqual({
            comment_id: 13,
          votes: 0,
          created_at: '2020-06-15T10:25:00.000Z',
          author: 'icellusedkars',
          body: 'Fruit pastilles',
          article_id: 1
        })
      });
  });
  test("400 status code: 'Invalid input: expected a number' if passed a p value that is not a number", () => {
    return request(app)
      .get("/api/articles/2/comments/?p=one")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input: expected a number");
      });
  });
  test("400 status code: 'Invalid input: expected a number' if passed a limit value that is not a number", () => {
    return request(app)
      .get("/api/articles/2/comments/?limit=one")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input: expected a number");
      });
  });
  test("200 status code: responds with an empty array when passed a limit value of 0", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=0")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(0);
      });
  });
  test("200 status code: responds with an empty array when passed a p value of 0", () => {
    return request(app)
      .get("/api/articles/1/comments?p=0")
      .expect(200)
      .then(({ body }) => {
        console.log(body)
        expect(body.comments.length).toBe(0);
      });
  });
});


describe("POST /api/articles/:article_id/comments", () => {
  test("201 status code: responds with the posted comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "lurker",
        body: "A little tale ",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.addedComment).toMatchObject({
          author: "lurker",
          body: "A little tale ",
          article_id: 1,
          comment_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
        });
      });
  });
  test('400 status code: "Invalid input: expected a number" if passed an article id that is not a number', () => {
    return request(app)
      .post("/api/articles/one/comments")
      .send({
        username: "lurker",
        body: "A little tale ",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input: expected a number");
      });
  });
  test('404 status code: "That username/author does not exist!" if passed a username that does not exist in the users table', () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "Wee willy winky",
        body: "A little tale ",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That username/author does not exist!");
      });
  });
  test('404 status code: "That article does not exist!" if passed an article_id that does not exist in articles table', () => {
    return request(app)
      .post("/api/articles/30/comments")
      .send({
        username: "lurker",
        body: "A little tale ",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That article does not exist!");
      });
  });
  test('400 status code: "Incomplete POST request: one or more required fields missing data" when sent a post request lacking a required key', () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        body: "A little tale",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "Incomplete POST request: one or more required fields missing data"
        );
      });
  });
  test("201 status code: responds with the posted comment when sent a body with additional properties", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "lurker",
        body: "A little tale",
        votes: 1,
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.addedComment).toMatchObject({
          author: "lurker",
          body: "A little tale",
          article_id: 1,
          comment_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
        });
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200 status code: responds with updated article when passed an object in the form of { inc_votes: newVote } where inc_votes is 1", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle).toEqual({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 101,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("200 status code: responds with updated article when passed an object in the form of { inc_votes: newVote } where inc_votes is >1", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 3 })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle).toEqual({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 103,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("200 status code: responds with updated article when passed an object in the form of { inc_votes: newVote } where inc_votes is 0", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 0 })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle).toEqual({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("200 status code: responds with updated article when passed an object in the form of { inc_votes: newVote } where inc_votes is -1", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle).toEqual({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 99,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("200 status code: responds with updated article when passed an object in the form of { inc_votes: newVote } where inc_votes is <-1", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -3 })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle).toEqual({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 97,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("400 status code: responds with 'We're not popular enough to subtract that amount! We only have {current number of} votes!' if sent a negative number greater than the initial number of votes", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -150 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "We're not popular enough to subtract that amount! We only have 100 votes!"
        );
      });
  });
  test("404 status code: responds with 'That article does not exist!' if passed an article_id that doesn't exist", () => {
    return request(app)
      .patch("/api/articles/30")
      .send({ inc_votes: 3 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That article does not exist!");
      });
  });
  test("400 status code: responds with 'Invalid input: expected a number' when passed a value that is not a number for inc_votes", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({ inc_votes: "four" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input: expected a number");
      });
  });
  test('400 status code: "Incomplete PATCH request: missing "inc_votes" property!" when sent a body missing inc_votes', () => {
    return request(app)
      .patch("/api/articles/3")
      .send({
        author: "Newton",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "Incomplete PATCH request: missing 'inc_votes' property!"
        );
      });
  });
  test('400 status code: "Invalid input: expected a number", when passed an article_id that is not a number', () => {
    return request(app)
      .patch("/api/articles/four")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input: expected a number");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("status 204, no response", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then((response) => {
        expect(Object.keys(response)).not.toInclude("body");
      });
  });
  test('status 404, responds with "That comment does not exist!" if passed a comment_id that doesn\'t exist', () => {
    return request(app)
      .delete("/api/comments/30")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That comment does not exist!");
      });
  });
  test('status 400, responds with "Invalid input: expected a number" if passed a comment_id that is not a number', () => {
    return request(app)
      .delete("/api/comments/three")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid input: expected a number");
      });
  });
});

describe("GET /api/users", () => {
  test("200 status: responds with an array of all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBe(4);
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/users/:username", () => {
  test("200 status code: responds with a user object corresponding to the username passed, when that user exists", () => {
    return request(app)
      .get("/api/users/lurker")
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: "lurker",
          name: "do_nothing",
          avatar_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
        });
      });
  });
  test("404 status code: responds with a message of 'That username/author does not exist' when passed a username that does not exist", () => {
    return request(app)
      .get("/api/users/lurking")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That username/author does not exist!");
      });
  });
  test("404 status code: responds with a message of 'That username/author does not exist' when passed a number", () => {
    return request(app)
      .get("/api/users/1")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That username/author does not exist!");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200 status code: responds with updated comment when passed an object in the form of { inc_votes: newVote } where inc_votes is 1", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedComment).toEqual({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 17,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
          comment_id: 1,
        });
      });
  });
  test("200 status code: responds with updated comment when passed an object in the form of { inc_votes: newVote } where inc_votes is <0", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedComment).toEqual({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 15,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
          comment_id: 1,
        });
      });
  });
  test("200 status code: responds with same comment when passed an object in the form of { inc_votes: newVote } where inc_votes is 0", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 0 })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedComment).toEqual({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 16,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
          comment_id: 1,
        });
      });
  });
  test("400 status code: responds with message 'We're not popular enough to subtract that amount! We only have {current number of} votes!' where inc_votes is a negative number greater than the current number of votes", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -20 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual(
          "We're not popular enough to subtract that amount! We only have 16 votes!"
        );
      });
  });
  test("400 status code: responds with message 'Incomplete PATCH request: missing 'inc_votes' property!' where sent object does not include the inc_votes property", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual(
          "Incomplete PATCH request: missing 'inc_votes' property!"
        );
      });
  });
  test("400 status code: responds with message 'Invalid input: expected a number' where passed a string for the comment_id", () => {
    return request(app)
      .patch("/api/comments/one")
      .send({ inc_votes: 2 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Invalid input: expected a number");
      });
  });
  test("400 status code: responds with message 'Invalid input: expected a number' where passed a string for the inc_votes value", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "two" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("Invalid input: expected a number");
      });
  });
  test("404 status code: responds with message 'That comment does not exist!' where passed a comment_id that doesn't exist", () => {
    return request(app)
      .patch("/api/comments/400")
      .send({ inc_votes: 2 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("That comment does not exist!");
      });
  });
  test("404 status code: responds with message 'That comment does not exist!' where passed a comment_id that doesn't exist", () => {
    return request(app)
      .patch("/api/comments/400")
      .send({ inc_votes: 2 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual("That comment does not exist!");
      });
  });
  test("200 status code: responds with updated comment when passed an object in the form of { inc_votes: newVote } where inc_votes is 1 AND object includes additional properties (ignores these additional props)", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1, extra_property: "whatever" })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedComment).toEqual({
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 17,
          author: "butter_bridge",
          article_id: 9,
          created_at: expect.any(String),
          comment_id: 1,
        });
      });
  });
});

describe("POST /api/articles", () => {
  test("201 status code: responds with the posted article when sent body with all required properties and an article_img_url", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "my very special article",
        body: "my lovely lovely body",
        topic: "cats",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.addedArticle).toMatchObject({
          author: "lurker",
          title: "my very special article",
          body: "my lovely lovely body",
          topic: "cats",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });
  test("201 status code: responds with the posted article including the default img_url when sent body with all required properties but no article_img_url", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "my very special article",
        body: "my lovely lovely body",
        topic: "cats",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.addedArticle).toMatchObject({
          author: "lurker",
          title: "my very special article",
          body: "my lovely lovely body",
          topic: "cats",
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });
  test("400 status code: responds with 'Incomplete POST request: one or more required fields missing data' when sent a body missing one or more required fields", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "my very special article",
        topic: "cats",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "Incomplete POST request: one or more required fields missing data"
        );
      });
  });
  test("404 status code: responds with 'That username/author does not exist!' when sent an author property value that does not exist in the users table", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurking",
        title: "my very special article",
        topic: "cats",
        body: "my lovely lovely body",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That username/author does not exist!");
      });
  });
  test("404 status code: responds with 'That topic does not exist!' when sent a topic property value that does not exist in the topics table", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "my very special article",
        topic: "mice",
        body: "my lovely lovely body",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That topic does not exist!");
      });
  });
  test("201 status code: responds with the posted article when sent body with all required properties and an article_img_url plus additional unrequired properties (these will be ignored)", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "my very special article",
        body: "my lovely lovely body",
        topic: "cats",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        extra_property: 4,
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.addedArticle).toMatchObject({
          author: "lurker",
          title: "my very special article",
          body: "my lovely lovely body",
          topic: "cats",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });
  test("201 status code: responds with the posted article when sent a body that has a number rather than a string for any property (number will be converted into a string in response article)", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "my very special article",
        topic: "cats",
        body: 1,
        article_img_url:
          "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.addedArticle).toMatchObject({
          author: "lurker",
          title: "my very special article",
          body: "1",
          topic: "cats",
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });
  test("400 status code: responds with 'Incomplete POST request: one or more required fields missing data' if passed a body where one or more properties has no value", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "my very special article",
        topic: "cats",
        body: "",
        article_img_url:
          "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "Incomplete POST request: one or more required fields missing data"
        );
      });
  });
  test("201 status code: responds with the added article if sent a complete body that has an empty string for url, with added article using default url", () => {
    return request(app)
      .post("/api/articles")
      .send({
        author: "lurker",
        title: "my very special article",
        topic: "cats",
        body: "whatevs",
        article_img_url: "",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.addedArticle).toMatchObject({
          author: "lurker",
          title: "my very special article",
          body: "whatevs",
          topic: "cats",
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
        });
      });
  });
});
