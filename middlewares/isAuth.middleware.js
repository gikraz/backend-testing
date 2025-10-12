const jwt = require('jsonwebtoken')
require('dotenv').config()

const isAuth = async (req, res, next) => {
    const headers = req.headers['authorization']
    if(!headers) {
        return res.status(401).json({message: "you dont have permition"})
    }

    const [type, token] = headers.split(' ')
    try{
        const payload = await jwt.verify(token, process.env.JWT_SECRET)
        req.userId = payload.userId
        req.role = payload.role

        next()
    }catch(e){
        return res.status(401).json({message: "you dont have permition"})
    }
}

module.exports = isAuth