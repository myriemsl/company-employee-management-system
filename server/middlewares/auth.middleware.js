const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer')) return res.sendStatus(401);
    const accessToken = authHeader.split(' ')[2];

    jwt.verify(accessToken,
         process.env.ACCESS_TOKEN_SECRET,
          (err, user) => {
        if (err) return res.status(401).json({message :' Invalid Token'})
        req.user = user;
        next()
    })
}

const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.id === req.params.id || req.user.username || req.user.isAdmin){
            next()
        } else {
            return res.status(403).json({message: 'Not Authorized!'})
        }
    });
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.isAdmin){
            next()
        } else {
            return res.status(403).json({message: 'Not Authorized!'})
        }
    });
};





module.exports = { verifyToken, verifyUser, verifyAdmin };