const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// Import route modules
const insuranceRoutes = require('./routes/insurance');

const app = express();

// Use CORS middleware to allow Angular to communicate with the API
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  next();
});

// MongoDB Atlas connection
const dbUri = 'mongodb+srv://peirou:12345@cluster0.buwjhx5.mongodb.net/hospital?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.log('Connection to MongoDB Atlas failed!', error);
  });

// Patient schema and model
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

const Patient = mongoose.model('Patient', patientSchema);

// Use route modules
app.use('/api/insurance-forms', insuranceRoutes);

// GET all patients
app.get('/api/patients', (req, res, next) => {
  Patient.find()
    .then(documents => {
      res.status(200).json({
        message: 'Patients fetched successfully!',
        patients: documents
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching patients failed!'
      });
    });
});

// POST patient
app.post('/api/patients', (req, res, next) => {
  const patient = new Patient({
    regId: req.body.regId,
    patientId: req.body.patientId,
    name: req.body.name,
    age: req.body.age,
    gender: req.body.gender,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
    bloodGroup: req.body.bloodGroup,
    dateOfBirth: req.body.dateOfBirth,
    allergy: req.body.allergy,
    medicalHistory: req.body.medicalHistory,
    insurance: req.body.insurance
  });
  patient.save()
    .then(createdPatient => {
      res.status(201).json({
        message: 'Patient added successfully',
        patientId: createdPatient._id
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Creating a patient failed!'
      });
    });
});

// Get patient by patientId field (not MongoDB _id)
app.get('/api/patients/id/:patientId', (req, res, next) => {
  Patient.findOne({ patientId: req.params.patientId })
    .then(patient => {
      if (patient) {
        res.status(200).json(patient);
      } else {
        res.status(404).json({ message: 'Patient not found!' });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching patient failed!'
      });
    });
});

// Get patient by MongoDB _id
app.get('/api/patients/:id', (req, res, next) => {
  Patient.findById(req.params.id)
    .then(patient => {
      if (patient) {
        res.status(200).json(patient);
      } else {
        res.status(404).json({ message: 'Patient not found!' });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching patient failed!'
      });
    });
});

app.put('/api/patients/:id', (req, res, next) => {
  const patient = new Patient({
    _id: req.params.id,
    regId: req.body.regId,
    patientId: req.body.patientId,
    name: req.body.name,
    age: req.body.age,
    gender: req.body.gender,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
    bloodGroup: req.body.bloodGroup,
    dateOfBirth: req.body.dateOfBirth,
    allergy: req.body.allergy,
    medicalHistory: req.body.medicalHistory,
    insurance: req.body.insurance
  });
  Patient.updateOne({ _id: req.params.id }, patient)
    .then(result => {
      res.status(200).json({ message: 'Update successful!' });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Updating patient failed!'
      });
    });
});

// DELETE patient
app.delete('/api/patients/:id', (req, res, next) => {
  Patient.deleteOne({ _id: req.params.id })
    .then(result => {
      res.status(200).json({ message: 'Patient deleted!' });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Deleting patient failed!'
      });
    });
});

module.exports = app;