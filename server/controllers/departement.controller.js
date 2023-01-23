const Company = require('../models/company.model.js');
const Departement = require('../models/departement.model.js');
const asyncHandler = require('express-async-handler');


// @desc get departement
// @route GET /departement
// @access private
const getDepartement = asyncHandler(async (req, res) => {
    const departement = await Departement
    .findOne({_id: req.params.id })
    .populate("employees") 
    res.json(departement)
 });

// @desc add departement
// @route POST /departement
// @access private (manager access)
const addDepartement = asyncHandler(async (req, res) => {
    const company = req.params.company;
    const departement = new Departement(req.body);

    const newdepartement = await departement.save();
    await Company.findByIdAndUpdate(company, {
        $push: { departements: newdepartement._id },
      });
   res.status(200).json(newdepartement);
});

// @desc update departement
// @route UPDATE /departement
// @access private (manager access)
const updateDepartement = asyncHandler(async (req, res) => {
    const updateddepartement = await Departement.findByIdAndUpdate(
       req.params.id, { $set: req.body }, { new: true}
    );
    res.status(200).json(updateddepartement)
 })

// @desc delete departement
// @route DELETE /departement
// @access private (manager access)
const deleteDepartement = asyncHandler(async (req, res) => {
    const company = req.params.company;
    const departement = await Departement.findByIdAndDelete(req.params.id);
    if (departement) {
      await  Company.findByIdAndUpdate(company, {
       $pull: { departements: req.params.id },
      });
     res.status(200).json("departement deleted")
    }
 })

module.exports = { getDepartement, addDepartement, updateDepartement, deleteDepartement };