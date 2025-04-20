const mongoose = require('mongoose');

/**
 * Medical Report Schema
 * 
 * This schema defines the structure of medical report documents in MongoDB.
 */
const medicalReportSchema = mongoose.Schema({
  reportId: { type: String, required: true },
  patientId: { type: String, required: true },
  doctorName: { type: String, required: true },
  reportDate: { type: Date, required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String, required: true }
});

module.exports = mongoose.model('MedicalReport', medicalReportSchema);