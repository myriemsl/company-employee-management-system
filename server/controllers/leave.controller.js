const Leave = require('../models/leave.model.js');
const Employee = require('../models/employee.model.js');
const asyncHandler = require('express-async-handler');


// @desc add leave
// @route POST /leave
// @access private
const applyLeave = asyncHandler(async (req, res) => {
    const employee = req.params.company;
    const leave = new Leave(req.body);
    const newLeave = await leave.save();
    await Employee.findByIdAndUpdate(employee,
       {
          $push: {
             leaves: newLeave._id
          },
       });
       res.status(200).json(newLeave);
});

// @desc get leave
// @route GET /leave
// @access private
const getLeave = asyncHandler(async (req, res) => {
    const leave = await Leave.findOne({_id: req.params.id}).populate("leaves")
    res.json(leave)
});

// @desc update leave
// @route UPDATE /leave
// @access private
const updateLeave = asyncHandler(async (req, res) => {
    const {subject, from, to, status, employee, departement} = req.body
    if (status) {
       return res.status(400).json({message: 'you are not allowed'})
    }
    if(!subject || !from || !to || !employee || !departement) {
       res.status(400).json("required fields")
    }
    const updateLeave = await Leave.findByIdAndUpdate(
       req.params.id, { $set: req.body }, { new: true }
    );
    res.status(200).json(updateLeave)
});

// @desc update leave
// @route UPDATE /leave
// @access private (manager access)
const setStatusLeave = asyncHandler(async (req, res) => {
    const leaveStatus = {
       status: req.body.status
    }
    const leave = await Leave.findByIdAndUpdate(req.params.id, leaveStatus, {new: true})
    res.status(200).json({
       success: true,
       leave
    })
});

// @desc delete leave
// @route DELETE /leave
// @access private
const deleteLeave = asyncHandler(async (req, res) => {
    const employee = req.params.employee;
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (leave) {
      await  Company.findByIdAndUpdate(employee, {
       $pull: { leaves: req.params.id },
      });
     res.status(200).json("leave deleted")
    }
});


module.exports = { applyLeave, getLeave, updateLeave, setStatusLeave, deleteLeave };