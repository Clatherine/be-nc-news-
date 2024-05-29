const endpoints = require("../endpoints.json")

exports.getEndpoints = (req, res, next) =>{
    delete endpoints['GET /api']
    res.status(200).send({endpoints})
}
