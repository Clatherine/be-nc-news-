const request = require("supertest")
const app = require("../app.js")
const db = require("../db/connection.js")
const seed = require("../db/seeds/seed.js")
const testData = require("../db/data/test-data/index.js")

beforeEach(()=>{
    console.log("seeding...")
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
            expect(body.length).toBe(3)
            body.forEach((topic)=>{
                expect(topic).toMatchObject({
                    description: expect.any(String),
                    slug: expect.any(String)
                })
            })
        })
    })
})