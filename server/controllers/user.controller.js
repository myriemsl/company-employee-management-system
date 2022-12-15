const User = require('../models/user.model.js');
const sendEmail = require('../utils/sendEmailHandler');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc get all users
// @route GET /users
// @access private (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if(!users.length) {
        return res.status(400).json({message: 'no users found'})
    }
    res.json(users)
});

// @desc update one user
// @route PUT /user/:id
// @access private (user only)
const updateUser = asyncHandler(async (req, res) => {
   
    const {id, fullname, email, username, password, isAdmin, isActive } = req.body

    // Confirm data 
    if (!email || !username) {
        return res.status(400).json({ message: 'email and username are required' })
   }

   if (isActive || isAdmin || typeof isActive !== 'boolean' || typeof isAdmin !== 'boolean') {
    return res.status(400).json({message: 'You are not authorized to update status'});
   }
   
    // Does the user exist to update?
    const user = await User.findById(req.params.id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Check for duplicate 
    const duplicateUsername = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
    const duplicateEmail = await User.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec()


    // Allow updates to the original user 
    if (duplicateUsername && duplicateUsername?._id.toString() !== user._id.toString() || duplicateEmail && duplicateEmail?._id.toString() !== user._id.toString()) {
        return res.status(409).json({ message: 'already exists' })
    }

    user.fullname = fullname
   user.email = email
   user.username = username
   user.isAdmin = isAdmin
   user.isActive = isActive


   if (password) {
        // Hash password 
       user.password = await bcrypt.hash(password, 10) // salt rounds 
   }

    const updatedUser = await user.save()

    res.status(200).json({ message: `${updatedUser.username} updated` })

});

// @desc delete one user
// @route DELETE /user/:id
// @access private (admin and user)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).exec();

    if(!user) {
        return res.status(400).json({ message: 'user not found'})
    } else {
        await user.deleteOne();
        res.status(200).json({message : 'user has been deleted!'})
    }
    
});

// @desc update status
// @route UPDATE /user/:id
// @access private (admin only)
const updateStatus = asyncHandler(async(req, res) => {
    const {id, fullname, email, username, password, isAdmin, isActive} = req.body;

    // Confirm data 
    if (typeof isActive !== 'boolean' || typeof isAdmin !== 'boolean') {
    return res.status(400).json({message: 'required'});
   }

    if (fullname || email || username || password) {
        return res.status(400).json({ message: 'only user can update this' })
   }

   // Does the user exist to update?
   const user = await User.findById(req.params.id).exec()

   if (!user) {
       return res.status(400).json({ message: 'User not found' })
   }   
   user.isAdmin = isAdmin
   user.isActive = isActive

   const statusUpdated = await user.save()
    res.status(200).json({ message: `${statusUpdated.username} status updated` })

})


// @desc contact
// @route POST /user/contact
// @access private
const contact = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(400).json({ message: "user not found, please sign up or log in first"});
    }

    if (!subject || !message ) {
        return res.status(400).json({ message: "subject, message are required"})
    }

    const sent_from = user.email;
    const sent_to = process.env.USER;
    const reply_to = user.email;
    
    await sendEmail(subject, message, sent_from, sent_to, reply_to);
    res.status(200).json({success: true, message: "message sent"});

});


module.exports = { getAllUsers, updateUser, deleteUser, updateStatus, contact};
