const User = require('../models/user.model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');



// @desc register
// @route POST /register
// @access public
const register = asyncHandler(async (req, res) => {
    const {fullname, email, username, password, isAdmin, isActive} = req.body;
    
    // confirm data
    if (!email || !username || !password) {
        return res.status(400).json({message: 'all files are required'})
    }

    // check for duplicate
    /// check username
    const checkUsername = await User.findOne({ username }).lean().exec()
    if (checkUsername) {
        return res.status(409).json({ message: 'username taken'})
    }
    /// check email
    const checkEmail = await User.findOne({ email }).lean().exec()
    if (checkEmail) {
        return res.status(409).json({ message: 'email already registered'})
    }

    // hash password 
    const hashedPassword = await bcrypt.hash(password, 10); 
    
    newUser = new User ({
        ...req.body, password: hashedPassword,
    })
    await newUser.save();

    res.status(201).json({ message: `new user ${username} created`});
})


// @desc login
// @route POST /login
// @access public
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body
    if (!username || !password ) {
        return res.status(400).json({ message: 'all fields are required' })
    }
    
    const user = await User.findOne({ username }).exec()
    if (!user) {
        return res.status(401).json({message: 'please register first'})
    }

    const matchedPassword = await bcrypt.compare(password, user.password)
    if (!matchedPassword) {
        return res.status(401).json({ message: 'wrong password'})
    }

    const accessToken = jwt.sign(
        {id: user._id, isAdmin: user.isAdmin},
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h"}
    );


    const refrechToken = jwt.sign(
        {id: user._id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '1d'}
    )


    // create secure cookie with refresh token
    res.cookie('jwt', refrechToken, {
       // httpOnly: true,
      //  secure: true,
        sameSite: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ accessToken })

})



// @desc refresh
// @route GET /refresh
// @access public 
const refrech = (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.status(401).json({ message: 'unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken, 
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err) => {
            if (err) return res.status(403).json({ message: 'forbidden '})

            const user = await User.findOne({ id: req.params.id }).exec()

            if(!user) return res.status(401).json({ message: 'unauthorized' })

            const accessToken = jwt.sign(
                {id: user._id, isAdmin: user.isAdmin},
                process.env.ACCESS_TOKEN_SECRET, 
                { expiresIn: "1h"}
            );

           res.json({ accessToken })

        })
    )
};




// @desc logout
// @route POST /logout
// @access public 
const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies 
    if(!cookies?.jwt) return res.sendStatus(20)
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true
    })
    res.json({ message: 'cookie cleared'})
})



module.exports = { register, login, refrech, logout };

