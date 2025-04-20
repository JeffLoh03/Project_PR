const mongoose = require('mongoose');

/**
 * Insurance Form Schema
 * 
 * This schema defines the structure of insurance form documents in MongoDB.
 * Simplified to match frontend requirements.
 */
const insuranceFormSchema = mongoose.Schema({
  // Form information
  formId: { type: String, required: true },
  
  // Patient information
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  contactNumber: { type: String, required: true },
  
  // Insurance information
  insuranceCompany: { type: String, required: true },
  policyNumber: { type: String, required: true },
  
  // Billing information
  totalCharges: { type: Number, required: true },
  amountPaidByPatient: { type: Number, required: true },
  
  // Additional notes
  additionalNotes: { type: String },
  
  // Form date
  currentDate: { type: Date, required: true },
});

module.exports = mongoose.model('InsuranceForm', insuranceFormSchema);