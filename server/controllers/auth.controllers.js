const User = require('../models/user.model.js');
const Token = require('../models/token.model.js');
const sendEmail = require('../utils/sendEmailHandler.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');


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
    
    const newUser = new User ({
        ...req.body,
    })
    await newUser.save();

    let token = await new Token({
        userId: newUser._id,
        token: crypto.randomBytes(32).toString('hex'),
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000),
    }).save();

    const url = `${process.env.BASE_URL}/user/verify/${newUser.id}/${token.token}`;
   
    const subject = "verify email";
    const message = `
    <h3>Hello ${newUser.username}</h3>
    <p>click on the link below to verify your email</p>
    <a href=${url} clicktracking=off>${url}</a>
    <p>this link is valid only for 30 minutes.</p>
    `;

    const sent_to = newUser.email;
    const sent_from = process.env.USER;
    await sendEmail(subject, message, sent_to, sent_from);
    res.status(200).json({success: true, message: "verification link sent to your email"});
})



// @desc verify email
// @route GET /user/verify/:id/:token
// @access public
const verify = asyncHandler(async (req, res) => {
    const newUser = await User.findOne({_id: req.params.id});
    if(!newUser) return res.status(400).json({message: 'not found'});

    const token = await Token.findOne({
        userId: newUser._id,
        token: req.params.token,
    });

    if (!token) return res.status(400).json({message: 'invalid link'});
    await User.updateOne(
         { _id: newUser.id },
         { $set: { isVerified: true }}
        );
        await Token.findByIdAndRemove(token.userId);
        res.send("email verified successfully");
});


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



// @desc forgot password
// @route POST /forgotpassword
// @access public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({message: 'user not found'});
    }

    let token = await Token.findOne({ userId: user._id });
    if (token) {
        await token.deleteOne();
    }

    let resetToken = crypto.randomBytes(32).toString('hex') + user._id;
    console.log(resetToken);

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000),
    }).save();

    const resetURL = `${process.env.BASE_URL}/resetpassword/${resetToken}`;

    const subject = "reset password";
    const message = `
    <h3>Hello ${user.username}</h3>
    <p>click on the link below to reset your password</p>
    <a href=${resetURL} clicktracking=off>${resetURL}</a>
    <p>this link is valid only for 30 minutes.</p>
    `;

    const sent_to = user.email;
    const sent_from = process.env.USER;
    await sendEmail(subject, message, sent_to, sent_from);
    res.status(200).json({success: true, message: "reset password link sent to your email"});

})



// @desc reset password
// @route PUT /resetpassword/:resetToken
// @access privatte
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const token = await Token.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() },
    });
    if (!token) {
        return res.status(404).json({message: 'invalid or expired link'})
    }

    const user = await User.findOne({ _id: token.userId });
    user.password = password;
    await user.save();
    res.status(200).json({success: true, message: 'password successfully updated, please login'});

});


module.exports = { register, verify, login, refrech, logout, forgotPassword, resetPassword };

