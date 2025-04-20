const mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
  regId: { type: String, required: true },
  patientId: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  allergy: { type: String },
  medicalHistory: { type: String },
  insurance: { type: String }
});

module.exports = mongoose.model('Patient', patientSchema);