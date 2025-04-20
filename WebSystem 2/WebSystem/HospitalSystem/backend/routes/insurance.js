const express = require('express');
const router = express.Router();

// Import the Insurance model
const InsuranceForm = require('../models/insurance');

/**
 * GET all insurance forms
 * @route GET /api/insurance-forms
 * @returns {Object} JSON with message and array of insurance forms
 */
router.get('/', (req, res) => {
  console.log("Fetching all insurance forms");
  InsuranceForm.find()
    .then(documents => {
      res.status(200).json({
        message: 'Insurance forms fetched successfully!',
        insuranceForms: documents
      });
    })
    .catch(error => {
      console.error("Error fetching insurance forms:", error);
      res.status(500).json({
        message: 'Fetching insurance forms failed!'
      });
    });
});

/**
 * GET a specific insurance form by ID
 * @route GET /api/insurance-forms/:id
 * @param {string} id - The MongoDB ID of the insurance form
 * @returns {Object} JSON with insurance form data
 */
router.get('/:id', (req, res) => {
  console.log("Finding insurance form with ID:", req.params.id);
  InsuranceForm.findById(req.params.id)
    .then(form => {
      if (form) {
        res.status(200).json(form);
      } else {
        res.status(404).json({ message: 'Insurance form not found!' });
      }
    })
    .catch(error => {
      console.error("Error fetching insurance form:", error);
      res.status(500).json({
        message: 'Fetching insurance form failed!'
      });
    });
});

/**
 * GET insurance forms for a specific patient
 * @route GET /api/insurance-forms/patient/:patientId
 * @param {string} patientId - The ID of the patient
 * @returns {Object} JSON with message and array of insurance forms
 */
router.get('/patient/:patientId', (req, res) => {
  console.log("Getting insurance forms for patient:", req.params.patientId);
  InsuranceForm.find({ patientId: req.params.patientId })
    .then(documents => {
      res.status(200).json({
        message: 'Insurance forms for patient fetched successfully!',
        insuranceForms: documents
      });
    })
    .catch(error => {
      console.error("Error fetching patient insurance forms:", error);
      res.status(500).json({
        message: 'Fetching insurance forms failed!'
      });
    });
});

/**
 * POST a new insurance form
 * @route POST /api/insurance-forms
 * @param {Object} req.body - The insurance form data
 * @returns {Object} JSON with success message and new form ID
 */
router.post('/', (req, res) => {
  console.log("Creating new insurance form:", req.body);
  const insuranceForm = new InsuranceForm(req.body);
  
  insuranceForm.save()
    .then(createdForm => {
      res.status(201).json({
        message: 'Insurance form added successfully',
        formId: createdForm._id
      });
    })
    .catch(error => {
      console.error("Error saving insurance form:", error);
      res.status(500).json({
        message: 'Creating insurance form failed!',
        error: error.message
      });
    });
});

/**
 * PUT (update) an existing insurance form
 * @route PUT /api/insurance-forms/:id
 * @param {string} id - The MongoDB ID of the insurance form to update
 * @param {Object} req.body - The updated insurance form data
 * @returns {Object} JSON with success message and updated form data
 */
router.put('/:id', (req, res) => {
  console.log("Updating insurance form with ID:", req.params.id);
  console.log("Update data:", req.body);
  
  InsuranceForm.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .then(updatedForm => {
      if (!updatedForm) {
        console.log("Insurance form not found for update");
        return res.status(404).json({ message: 'Insurance form not found!' });
      }
      console.log("Insurance form updated successfully:", updatedForm);
      res.status(200).json({ 
        message: 'Update successful!',
        insuranceForm: updatedForm
      });
    })
    .catch(error => {
      console.error('Error updating insurance form:', error);
      res.status(500).json({
        message: 'Updating insurance form failed!',
        error: error.message
      });
    });
});

/**
 * DELETE an insurance form
 * @route DELETE /api/insurance-forms/:id
 * @param {string} id - The MongoDB ID of the insurance form to delete
 * @returns {Object} JSON with success message
 */
router.delete('/:id', (req, res) => {
  console.log("Deleting insurance form with ID:", req.params.id);
  InsuranceForm.findByIdAndDelete(req.params.id)
    .then(result => {
      if (result) {
        res.status(200).json({ message: 'Insurance form deleted!' });
      } else {
        res.status(404).json({ message: 'Insurance form not found!' });
      }
    })
    .catch(error => {
      console.error("Error deleting insurance form:", error);
      res.status(500).json({
        message: 'Deleting insurance form failed!',
        error: error.message
      });
    });
});

module.exports = router;