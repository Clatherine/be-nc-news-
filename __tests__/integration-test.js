const request = require("supertest")
const app = require("../app.js")
const db = require("../db/connection.js")
const seed = require("../db/seeds/seed.js")
const testData = require("../db/data/test-data/index.js")

beforeEach(()=>{
    return seed(testData)
})
afterAll(()=> db.end())

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

describe("GET /api/topics", ()=>{
    test("200 status code: returns array of all topics", ()=>{
        return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({body})=>{
            expect(body.topics.length).toBe(3)
            body.topics.forEach((topic)=>{
                expect(topic).toMatchObject({
                    description: expect.any(String),
                    slug: expect.any(String)
                })
            })
        })
    })
})

describe("GET /api", ()=>{
    test("200 status: returns object containing a key-value pair for all available endpoints", ()=>{
        return request(app)
        .get("/api")
        .expect(200)
        .then(({body})=>{
            const values = Object.values(body.endpoints)
            values.forEach((value)=>{
                expect(value).toMatchObject({
                    description: expect.any(String),
                    queries: expect.any(Object),
                    exampleResponse: expect.any(Object)
                })
            })
            const regEx = /\/api/
            const keys = Object.keys(body.endpoints)
            keys.forEach((key)=>{
                expect(regEx.test(key)).toBe(true)
            })
            })
        })
    }
)

describe("GET /api/articles/:article_id", ()=>{
    test("200 status code: responds with an article object corresponding to the article_id provided", ()=>{
        return request(app)
        .get("/api/articles/1")
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
            article_img_url: expect.any(String)
          })
        })
    })
    test("404 status code: No articles with that id! when passed an id that does not match any article in database", ()=>{
        return request(app)
        .get("/api/articles/1000")
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('No articles with that id!')
        })
    })
    test("400 status code: Bad Request when passed an id that is not a number", ()=>{
        return request(app)
        .get("/api/articles/one")
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Invalid input')
        })
    })
})

describe("GET /api/articles", ()=>{
    test("200 status code: responds with an array of all articles, sorted by date in descending order", ()=>{
        return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({body})=>{
            expect(body.articles.length).toBe(13)
            body.articles.forEach((article)=>{
                expect(article).toMatchObject({
                    author: expect.any(String),
                    title: expect.any(String),
                    article_id: expect.any(Number),
                    topic: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_img_url: expect.any(String),
                    comment_count: expect.any(String)
                })
                expect(article).not.toHaveProperty('body')
            })
            expect(body.articles).toBeSortedBy('created_at', {descending: true})
        })
    })
    test("400 status code: 'Bad Request' response if spell 'articles' incorrectly", ()=>{
        return request(app)
        .get('/api/article')
        .expect(404)
        .then(({body})=>{
            expect(body.msg).toBe('Route not found')
        })
    })
})