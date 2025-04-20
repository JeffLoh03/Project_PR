const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Import models
const Patient = require('./backend/models/patient');
const InsuranceForm = require('./backend/models/insurance');
const MedicalReport = require('./backend/models/medicalreport');

const app = express();
const port = 3000;

// Enable CORS for Angular app
app.use(cors());

// Parse JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// MongoDB connection string (choose one)
// For local development:
// const dbUri = 'mongodb://localhost:27017/hospital';
// For MongoDB Atlas 
const password = encodeURIComponent('12345');
const dbUri = `mongodb+srv://peirou:${password}@cluster0.buwjhx5.mongodb.net/hospital?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB connection
mongoose.connect(dbUri)
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.log('MongoDB connection failed!', err);
  });

// API routes for patients
app.get('/api/patients', (req, res) => {
  console.log('GET /api/patients - Fetching all patients');
  Patient.find()
    .then(documents => {
      console.log('Successfully fetched patients:', documents.length);
      res.status(200).json({
        message: 'Patients fetched successfully!',
        patients: documents
      });
    })
    .catch(error => {
      console.error('Error fetching patients:', error);
      res.status(500).json({
        message: 'Fetching patients failed!'
      });
    });
});

app.post('/api/patients', (req, res) => {
  console.log('POST /api/patients - Creating new patient:', req.body);
  const patient = new Patient(req.body);
  patient.save()
    .then(createdPatient => {
      console.log('Patient created successfully with ID:', createdPatient._id);
      res.status(201).json({
        message: 'Patient added successfully',
        patientId: createdPatient._id
      });
    })
    .catch(error => {
      console.error('Error creating patient:', error);
      res.status(500).json({
        message: 'Creating a patient failed!'
      });
    });
});

// Get patient by patientId field (not MongoDB _id)
app.get('/patients/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  console.log('GET /patients/:patientId - Fetching patient with patientId:', patientId);
  
  Patient.findOne({ patientId: patientId })
    .then(patient => {
      if (patient) {
        console.log('Patient found:', patient._id);
        res.status(200).json(patient);
      } else {
        console.log('Patient not found with patientId:', patientId);
        res.status(404).json({ message: 'Patient not found!' });
      }
    })
    .catch(error => {
      console.error('Error fetching patient by patientId:', error);
      res.status(500).json({
        message: 'Fetching patient failed!'
      });
    });
});

// Get patient by MongoDB _id
app.get('/api/patients/:id', (req, res) => {
  const id = req.params.id;
  console.log('GET /api/patients/:id - Fetching patient with ID:', id);
  
  Patient.findById(req.params.id)
    .then(patient => {
      if (patient) {
        console.log('Patient found:', patient._id);
        res.status(200).json(patient);
      } else {
        console.log('Patient not found with ID:', id);
        res.status(404).json({ message: 'Patient not found!' });
      }
    })
    .catch(error => {
      console.error('Error fetching patient by ID:', error);
      res.status(500).json({
        message: 'Fetching patient failed!'
      });
    });
});

app.put('/api/patients/:id', (req, res) => {
  const id = req.params.id;
  console.log('PUT /api/patients/:id - Updating patient with ID:', id);
  console.log('Update data:', req.body);
  
  const patient = new Patient({
    _id: req.params.id,
    ...req.body
  });
  Patient.updateOne({ _id: req.params.id }, patient)
    .then(result => {
      console.log('Patient update result:', result);
      res.status(200).json({ message: 'Update successful!' });
    })
    .catch(error => {
      console.error('Error updating patient:', error);
      res.status(500).json({
        message: 'Updating patient failed!'
      });
    });
});

app.delete('/api/patients/:id', (req, res) => {
  const id = req.params.id;
  console.log('DELETE /api/patients/:id - Deleting patient with ID:', id);
  
  Patient.deleteOne({ _id: req.params.id })
    .then(result => {
      console.log('Patient deletion result:', result);
      res.status(200).json({ message: 'Patient deleted!' });
    })
    .catch(error => {
      console.error('Error deleting patient:', error);
      res.status(500).json({
        message: 'Deleting patient failed!'
      });
    });
});

// API routes for insurance forms
app.get('/api/insurance-forms', (req, res) => {
  console.log('GET /api/insurance-forms - Fetching all insurance forms');
  
  InsuranceForm.find()
    .then(documents => {
      console.log('Successfully fetched insurance forms:', documents.length);
      res.status(200).json({
        message: 'Insurance forms fetched successfully!',
        insuranceForms: documents
      });
    })
    .catch(error => {
      console.error('Error fetching insurance forms:', error);
      res.status(500).json({
        message: 'Fetching insurance forms failed!'
      });
    });
});

// Route for getting forms by patient ID - MUST come BEFORE the /:id route
app.get('/api/insurance-forms/patient/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  console.log('GET /api/insurance-forms/patient/:patientId - Getting insurance forms for patient:', patientId);
  
  InsuranceForm.find({ patientId: req.params.patientId })
    .then(documents => {
      console.log('Successfully fetched insurance forms for patient:', documents.length);
      res.status(200).json({
        message: 'Insurance forms for patient fetched successfully!',
        insuranceForms: documents
      });
    })
    .catch(error => {
      console.error('Error fetching patient insurance forms:', error);
      res.status(500).json({
        message: 'Fetching insurance forms failed!'
      });
    });
});

// Routes for specific insurance form by ID
app.get('/api/insurance-forms/:id', (req, res) => {
  const id = req.params.id;
  console.log('GET /api/insurance-forms/:id - Fetching insurance form with ID:', id);
  
  InsuranceForm.findById(req.params.id)
    .then(form => {
      if (form) {
        console.log('Insurance form found:', form._id);
        res.status(200).json(form);
      } else {
        console.log('Insurance form not found with ID:', id);
        res.status(404).json({ message: 'Insurance form not found!' });
      }
    })
    .catch(error => {
      console.error('Error fetching insurance form:', error);
      res.status(500).json({
        message: 'Fetching insurance form failed!'
      });
    });
});

app.post('/api/insurance-forms', (req, res) => {
  console.log('POST /api/insurance-forms - Creating new insurance form:', req.body);
  
  const insuranceForm = new InsuranceForm(req.body);
  insuranceForm.save()
    .then(createdForm => {
      console.log('Insurance form created successfully with ID:', createdForm._id);
      res.status(201).json({
        message: 'Insurance form added successfully',
        formId: createdForm._id
      });
    })
    .catch(error => {
      console.error('Error creating insurance form:', error);
      res.status(500).json({
        message: 'Creating insurance form failed!'
      });
    });
});

app.put('/api/insurance-forms/:id', (req, res) => {
  const id = req.params.id;
  console.log('PUT /api/insurance-forms/:id - Updating insurance form with ID:', id);
  console.log('Update data:', req.body);
  
  // Extract ID from the request parameters
  const formId = req.params.id;
  
  // Create a clean update object with only the fields from our simplified schema
  const updateData = {
    formId: req.body.formId,
    patientId: req.body.patientId,
    patientName: req.body.patientName,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    contactNumber: req.body.contactNumber,
    insuranceCompany: req.body.insuranceCompany,
    policyNumber: req.body.policyNumber,
    totalCharges: req.body.totalCharges,
    amountPaidByPatient: req.body.amountPaidByPatient,
    additionalNotes: req.body.additionalNotes,
    currentDate: req.body.currentDate
  };
  
  // Remove any undefined fields to prevent errors
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });
  
  console.log('Cleaned update data:', updateData);
  
  // Use update instead of findByIdAndUpdate to troubleshoot
  InsuranceForm.updateOne(
    { _id: formId },
    { $set: updateData }
  )
    .then(result => {
      console.log('Insurance form update result:', result);
      
      if (result.matchedCount === 0) {
        console.log('No insurance form found with ID:', formId);
        return res.status(404).json({ 
          message: 'Insurance form not found!',
          id: formId
        });
      }
      
      if (result.modifiedCount === 0) {
        console.log('No changes were made to the insurance form');
      } else {
        console.log('Insurance form updated successfully');
      }
      
      res.status(200).json({ 
        message: 'Update successful!',
        result: result
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

app.delete('/api/insurance-forms/:id', (req, res) => {
  const id = req.params.id;
  console.log('DELETE /api/insurance-forms/:id - Deleting insurance form with ID:', id);
  
  InsuranceForm.deleteOne({ _id: req.params.id })
    .then(result => {
      console.log('Insurance form deletion result:', result);
      res.status(200).json({ message: 'Insurance form deleted!' });
    })
    .catch(error => {
      console.error('Error deleting insurance form:', error);
      res.status(500).json({
        message: 'Deleting insurance form failed!'
      });
    });
});

// API routes for medical reports
app.get('/api/medical-reports', (req, res) => {
  console.log('GET /api/medical-reports - Fetching all medical reports');
  
  MedicalReport.find()
    .then(documents => {
      console.log('Successfully fetched medical reports:', documents.length);
      res.status(200).json({
        message: 'Medical reports fetched successfully!',
        medicalReports: documents
      });
    })
    .catch(error => {
      console.error('Error fetching medical reports:', error);
      res.status(500).json({
        message: 'Fetching medical reports failed!'
      });
    });
});

// Route for getting medical reports by patient ID - MUST come BEFORE the /:id route
app.get('/api/medical-reports/patient/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  console.log('GET /api/medical-reports/patient/:patientId - Getting medical reports for patient:', patientId);
  
  MedicalReport.find({ patientId: req.params.patientId })
    .then(documents => {
      console.log('Successfully fetched medical reports for patient:', documents.length);
      res.status(200).json({
        message: 'Medical reports for patient fetched successfully!',
        medicalReports: documents
      });
    })
    .catch(error => {
      console.error('Error fetching patient medical reports:', error);
      res.status(500).json({
        message: 'Fetching medical reports failed!'
      });
    });
});

// Routes for specific medical report by ID
app.get('/api/medical-reports/:id', (req, res) => {
  const id = req.params.id;
  console.log('GET /api/medical-reports/:id - Fetching medical report with ID:', id);
  
  MedicalReport.findById(req.params.id)
    .then(report => {
      if (report) {
        console.log('Medical report found:', report._id);
        res.status(200).json(report);
      } else {
        console.log('Medical report not found with ID:', id);
        res.status(404).json({ message: 'Medical report not found!' });
      }
    })
    .catch(error => {
      console.error('Error fetching medical report:', error);
      res.status(500).json({
        message: 'Fetching medical report failed!'
      });
    });
});

app.post('/api/medical-reports', (req, res) => {
  console.log('POST /api/medical-reports - Creating new medical report:', req.body);
  
  const medicalReport = new MedicalReport(req.body);
  medicalReport.save()
    .then(createdReport => {
      console.log('Medical report created successfully with ID:', createdReport._id);
      res.status(201).json({
        message: 'Medical report added successfully',
        reportId: createdReport._id
      });
    })
    .catch(error => {
      console.error('Error creating medical report:', error);
      res.status(500).json({
        message: 'Creating medical report failed!'
      });
    });
});

app.put('/api/medical-reports/:id', (req, res) => {
  const id = req.params.id;
  console.log('PUT /api/medical-reports/:id - Updating medical report with ID:', id);
  console.log('Update data:', req.body);
  
  // Use findByIdAndUpdate for better handling, similar to the insurance forms
  MedicalReport.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .then(updatedReport => {
      if (!updatedReport) {
        console.log('Medical report not found for update with ID:', id);
        return res.status(404).json({ message: 'Medical report not found!' });
      }
      console.log('Medical report updated successfully:', updatedReport._id);
      res.status(200).json({ 
        message: 'Update successful!',
        medicalReport: updatedReport
      });
    })
    .catch(error => {
      console.error('Error updating medical report:', error);
      res.status(500).json({
        message: 'Updating medical report failed!',
        error: error.message
      });
    });
});

app.delete('/api/medical-reports/:id', (req, res) => {
  const id = req.params.id;
  console.log('DELETE /api/medical-reports/:id - Deleting medical report with ID:', id);
  
  MedicalReport.deleteOne({ _id: req.params.id })
    .then(result => {
      console.log('Medical report deletion result:', result);
      res.status(200).json({ message: 'Medical report deleted!' });
    })
    .catch(error => {
      console.error('Error deleting medical report:', error);
      res.status(500).json({
        message: 'Deleting medical report failed!'
      });
    });
});

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist/hospital-system')));

// Redirect all other routes to index.html
// This must come after all other routes
app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/hospital-system/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});