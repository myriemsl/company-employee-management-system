const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer')) return res.sendStatus(401);
    const accessToken = authHeader.split(' ')[2];

    jwt.verify(accessToken,
         process.env.ACCESS_TOKEN_SECRET,
          (err, employee) => {
        if (err) return res.status(401).json({message :' Invalid Token'})
        req.employee = employee;
        next()
    })
}

const verifyEmployee = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.employee.id === req.params.id || req.employee.isManager){
            next()
        } else {
            return res.status(403).json({message: 'Not Authorized!'})
        }
    });
};

const verifyManager = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.employee.isManager){
            next()
        } else {
            return res.status(403).json({message: 'Not Authorized!'})
        }
    });
};





module.exports = { verifyToken, verifyEmployee, verifyManager };