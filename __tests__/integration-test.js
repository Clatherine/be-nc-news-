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
  test("200 status code: responds with an article object corresponding to the article_id provided that includes a comment_count property with a value equal to the number of comments associated with that article; works when comment_count > 0", ()=>{
    return request(app)
    .get('/api/articles/1')
    .expect(200)
    .then(({body})=>{
        expect(body.article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: 1,
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: 11
        })
    })
})
test("200 status code: responds with an article object corresponding to the article_id provided that includes a comment_count property with a value equal to the number of comments associated with that article; works when comment_count = 0", ()=>{
    return request(app)
    .get('/api/articles/2')
    .expect(200)
    .then(({body})=>{
        expect(body.article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: 2,
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: 0
        })
    })
})
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
test("200 status code: responds with an array of articles filtered by the topic provided, sorted by date in descending order, when passed a query of 'topic' with a topic that exists and has matching articles", ()=>{
    return request(app)
    .get('/api/articles?topic=mitch')
    .expect(200)
    .then(({body})=>{
        expect(body.articles.length).toBe(12)
        expect(body.articles).toBeSortedBy("created_at", {descending: true})
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
    })
})
test("200 status code: resolves with an empty array if passed a query of 'topic' with a topic name that exists but has no associated articles", ()=>{
    return request(app)
    .get('/api/articles?topic=paper')
    .expect(200)
    .then(({body})=>{
        expect(body.articles.length).toBe(0)
    })
})
test("404 status code: resolves with a message of 'That topic does not exist!' if passed a query of 'topic' with a topic that doesn't exist", ()=>{
    return request(app)
    .get('/api/articles/?topic=plants')
    .expect(404)
    .then(({body})=>{
        expect(body.msg).toBe('That topic does not exist!')
    })
})
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200 status code: responds with an array of comments for the given article_id, ordered by created_at in descending order", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(11)
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
  test('404 status code: "That username does not exist!" if passed a username that does not exist in the users table', () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "Wee willy winky",
        body: "A little tale ",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("That username does not exist!");
      });
  });
  test('404 status code: "That article does not exist!" if passed an article_id that does not exist in articles table', ()=>{
    return request(app)
    .post("/api/articles/30/comments")
    .send({
        username: "lurker",
        body: "A little tale ",
    })
    .expect(404)
    .then(({ body}) =>{
            expect(body.msg).toBe("That article does not exist!")
        })
    })
    test('400 status code: "Incomplete POST request: one or more required fields missing data" when sent a post request lacking a required key', ()=>{
        return request(app)
        .post("/api/articles/1/comments")
        .send({
            body:"A little tale"
        })
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe("Incomplete POST request: one or more required fields missing data")
        })
    })
    test('201 status code: responds with the posted comment when sent a body with additional properties', ()=>{
        return request(app)
        .post("/api/articles/1/comments")
        .send({
            username: "lurker",
            body:"A little tale",
            votes: 1
        })
        .expect(201)
        .then(({body})=>{
            expect(body.addedComment).toMatchObject({
                author: "lurker",
                body: "A little tale",
                article_id: 1,
                comment_id: expect.any(Number),
                votes: 0,
                created_at: expect.any(String)
              })
        })
    })

  })

describe("PATCH /api/articles/:article_id", ()=>{
    test("200 status code: responds with updated article when passed an object in the form of { inc_votes: newVote } where newVote is 1", ()=>{
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes : 1 })
        .expect(200)
        .then(({body})=>{
          expect(body.updatedArticle).toEqual({
            author: 'butter_bridge',
            title: 'Living in the shadow of a great man',
            article_id: 1,
            body: 'I find this existence challenging',
            topic: 'mitch',
            created_at: '2020-07-09T20:11:00.000Z',
            votes: 101,
            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
          })
        })
    })
    test("200 status code: responds with updated article when passed an object in the form of { inc_votes: newVote } where newVote is >1", ()=>{
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes : 3 })
        .expect(200)
        .then(({body})=>{
          expect(body.updatedArticle).toEqual({
            author: 'butter_bridge',
            title: 'Living in the shadow of a great man',
            article_id: 1,
            body: 'I find this existence challenging',
            topic: 'mitch',
            created_at: '2020-07-09T20:11:00.000Z',
            votes: 103,
            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
          })
        })
    })
    test("200 status code: responds with updated article when passed an object in the form of { inc_votes: newVote } where newVote is -1", ()=>{
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes : -1 })
        .expect(200)
        .then(({body})=>{
          expect(body.updatedArticle).toEqual({
            author: 'butter_bridge',
            title: 'Living in the shadow of a great man',
            article_id: 1,
            body: 'I find this existence challenging',
            topic: 'mitch',
            created_at: '2020-07-09T20:11:00.000Z',
            votes: 99,
            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
          })
        })
    })
    test("200 status code: responds with updated article when passed an object in the form of { inc_votes: newVote } where newVote is <-1", ()=>{
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes : -3 })
        .expect(200)
        .then(({body})=>{
          expect(body.updatedArticle).toEqual({
            author: 'butter_bridge',
            title: 'Living in the shadow of a great man',
            article_id: 1,
            body: 'I find this existence challenging',
            topic: 'mitch',
            created_at: '2020-07-09T20:11:00.000Z',
            votes: 97,
            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
          })
        })
    })
    test("400 status code: responds with 'We're not popular enough to subtract that amount!' if sent a negative number greater than the initial number of votes", ()=>{
        return request(app)
        .patch('/api/articles/1')
        .send({ inc_votes : -150 })
        .expect(400)
        .then(({body})=>{
          expect(body.msg).toBe('We\'re not popular enough to subtract that amount!')
        })
    })
    test("404 status code: responds with 'That article does not exist!' if passed an article_id that doesn't exist", ()=>{
        return request(app)
        .patch('/api/articles/30')
        .send({ inc_votes : 3 })
        .expect(404)
        .then(({body})=>{
          expect(body.msg).toBe('That article does not exist!')
        })
    })
    test("400 status code: responds with 'Invalid input: expected a number' when passed a value that is not a number for inc_votes", ()=>{
        return request(app)
        .patch('/api/articles/3')
        .send({ inc_votes : "four"})
        .expect(400)
        .then(({body})=>{
          expect(body.msg).toBe('Invalid input: expected a number')
        })
    })
    test('400 status code: "Incomplete PATCH request: missing "inc_votes" property!" when sent a body missing inc_votes', ()=>{
        return request(app)
        .patch('/api/articles/3')
        .send({
            author: "Newton"
        })
        .expect(400)
        .then(({body})=>{
          expect(body.msg).toBe("Incomplete PATCH request: missing 'inc_votes' property!")
        })
    })
    test('400 status code: "Invalid input: expected a number", when passed an article_id that is not a number', ()=>{
        return request(app)
        .patch('/api/articles/four')
        .send({inc_votes : 1})
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Invalid input: expected a number')
        })
    })
})
//these tests are throwing out status 500 errors even though they are passing

describe("DELETE /api/comments/:comment_id", ()=>{
    test('status 204, no response', ()=>{
        return request(app)
        .delete('/api/comments/1')
        .expect(204)
        .then((response)=>{
            expect(Object.keys(response)).not.toInclude('body')
    })
    })
    test('status 404, responds with "That comment does not exist!" if passed a comment_id that doesn\'t exist', ()=>{
        return request(app)
        .delete('/api/comments/30')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('That comment does not exist!')
    })
    })
    test('status 400, responds with "Invalid input: expected a number" if passed a comment_id that is not a number', ()=>{
        return request(app)
        .delete('/api/comments/three')
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Invalid input: expected a number')
    })
    })

})

describe("GET /api/users", ()=>{
    test("200 status: responds with an array of all users", ()=>{
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({body})=>{
            expect(body.users.length).toBe(4)
            body.users.forEach((user)=>{
                expect(user).toMatchObject({
                    username: expect.any(String),
                    name: expect.any(String),
                    avatar_url: expect.any(String)
                })
            })
        })
    })
})
