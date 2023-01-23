const Company = require('../models/company.model.js');
const asyncHandler = require('express-async-handler');


// @desc get company
// @route GET /company
// @access public
const getCompany = asyncHandler(async (req, res) => {
    const company = await Company
    .findOne({_id: req.params.id })
    .populate("departements") 
    res.json(company)
 });

 // @desc add company
// @route POST /company/:id
// @access private (manager access)
const addCompany = asyncHandler(async (req, res) => {

    const company = new Company ({
       ...req.body
    });
    await company.save();
    res.status(200).json(company)
 });


// @desc update company
// @route PUT /company/:id
// @access private (manager access)
const updateCompany = asyncHandler(async (req, res) => {
    const company = {
       ...req.body
    }
    const updatedCompany = await Company.findByIdAndUpdate(req.params.id, company, {new: true})
    res.status(200).json({sucess: true, updatedCompany})
 
 });

// @desc delete company
// @route DELETE /company/:id
// @access private (manager access)
const deleteCompany = asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id).exec();
 
     if(company) {
       await company.deleteOne();
         return res.status(200).json({ message: 'company deleted'})
     } 
 })

 module.exports = { getCompany, addCompany, updateCompany, deleteCompany };