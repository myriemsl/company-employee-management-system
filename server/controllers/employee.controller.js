const Employee = require('../models/employee.model.js');
const Departement = require('../models/departement.model.js');
const sendEmail = require('../utils/sendEmailHandler');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc get all employee
// @route GET /employee
// @access private (manager access)
const getAllEmployees = asyncHandler(async (req, res) => {
    const employees = await Employee.find().select('-password').lean();
    if(!employees.length) {
        return res.status(400).json({message: 'no employees found'})
    }
    res.json(employees)
});


// @desc add employee
// @route POST /add/employee
// @access private (manager access)
const addEmployee = asyncHandler(async (req, res) => {
    const departement = req.params.departement;
     // check for duplicate email
     const checkEmail = await Employee.findOne({ email }).lean().exec()
     if (checkEmail) {
         return res.status(409).json({ message: 'email already registered'})
     }
    const newEmployee = new Employee(req.body);
    const employee = await newEmployee.save();
    await Departement.findByIdAndUpdate(departement, {
        $push: { employees: employee._id}
    });
    res.status(200).json(employee);
})

// @desc update employee
// @route PUT /employee/:id
// @access private (employee access)
const updateEmployee = asyncHandler(async (req, res) => {
   
    const {id, fullname, email, password, isManager, isActive } = req.body

    // Confirm data 
    if (!email) {
        return res.status(400).json({ message: 'email are required' })
   }

   if (isManager || isActive) {
    return res.status(400).json({message: 'you are not authorized to update status'});
   }
   
    // Does the employee exist to update?
    const employee = await Employee.findById(req.params.id).exec()

    if (!employee) {
        return res.status(400).json({ message: 'employee not found' })
    }

    
    // Check for duplicate 
    const duplicateEmail = await Employee.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow updates to the original employee 
    if (duplicateEmail && duplicateEmail?._id.toString() !== employee._id.toString()) {
        return res.status(409).json({ message: 'already exists' })
    }

    employee.fullname = fullname
    employee.email = email
      

   if (password) {
        // Hash password 
       employee.password = await bcrypt.hash(password, 10) // salt rounds 
   }

   const updatedEmployee = await employee.save()
   res.status(200).json({ updatedEmployee })

});

// @desc delete employee
// @route DELETE /employee/:id
// @access private (manager and employee)
const deleteEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id).exec();

    if(!employee) {
        return res.status(400).json({ message: 'employee not found'})
    } else {
        await employee.deleteOne();
        res.status(200).json({message : 'employee has been deleted!'})
    }
    
});

// @desc set role
// @route UPDATE /employee/role/:id
// @access private (manager access)
const setRole = asyncHandler(async(req, res) => {
    const role = {
        isManager: req.body.isManager
    }
   const employee = await Employee.findByIdAndUpdate(req.params.id, role, { new : true });
   res.status(200).json({success: true, employee})
})

// @desc set status
// @route UPDATE /employee/status/:id
// @access private (manager access)
const setStatus = asyncHandler(async(req, res) => {
    const status = {
        isActive: req.body.isActive,
    }
   const employee = await Employee.findByIdAndUpdate(req.params.id, status, { new : true });
   res.status(200).json({success: true, employee})
})

// @desc contact
// @route POST /employee/contact
// @access private
const contact = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    const employee = await Employee.findOne({email: req.body.email});
    if (!employee) {
        return res.status(400).json({ message: "employee not found, please sign up or log in first"});
    }

    if (!subject || !message ) {
        return res.status(400).json({ message: "subject, message are required"})
    }

    const sent_from = employee.email;
    const sent_to = process.env.USER;
    const reply_to = employee.email;
    
    await sendEmail(subject, message, sent_from, sent_to, reply_to);
    res.status(200).json({success: true, message: "message sent"});

});


module.exports = { getAllEmployees, addEmployee, updateEmployee, deleteEmployee, setRole, setStatus, contact };
