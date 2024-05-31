const {checkUserExists, fetchUsers, fetchUserByUsername} = require("../models/users.model.js")

exports.getUsers = (req, res, next)=>{
    fetchUsers().then((users) =>{
        res.status(200).send({users})
    }).catch((err)=>{
        next(err)
    })
}

exports.getUserByUsername = (req,res,next)=>{
    const {username} = req.params
    const promisesArr = [checkUserExists(username), fetchUserByUsername(username)]
    Promise.all(promisesArr).then((returnedPromises)=>{
        const user = returnedPromises[1]
        res.status(200).send({user})
    }).catch((err)=>{
        next(err)
    })
}