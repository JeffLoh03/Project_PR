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

app.post('/api/patients', (req, res) => {
  const patient = new Patient(req.body);
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
app.get('/patients/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  
  Patient.findOne({ patientId: patientId })
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
app.get('/api/patients/:id', (req, res) => {
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

app.put('/api/patients/:id', (req, res) => {
  const patient = new Patient({
    _id: req.params.id,
    ...req.body
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

app.delete('/api/patients/:id', (req, res) => {
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

// API routes for insurance forms
app.get('/api/insurance-forms', (req, res) => {
  InsuranceForm.find()
    .then(documents => {
      res.status(200).json({
        message: 'Insurance forms fetched successfully!',
        insuranceForms: documents
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching insurance forms failed!'
      });
    });
});

// Route for getting forms by patient ID - MUST come BEFORE the /:id route
app.get('/api/insurance-forms/patient/:patientId', (req, res) => {
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

// Routes for specific insurance form by ID
app.get('/api/insurance-forms/:id', (req, res) => {
  InsuranceForm.findById(req.params.id)
    .then(form => {
      if (form) {
        res.status(200).json(form);
      } else {
        res.status(404).json({ message: 'Insurance form not found!' });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching insurance form failed!'
      });
    });
});

app.post('/api/insurance-forms', (req, res) => {
  const insuranceForm = new InsuranceForm(req.body);
  insuranceForm.save()
    .then(createdForm => {
      res.status(201).json({
        message: 'Insurance form added successfully',
        formId: createdForm._id
      });
    })
    .catch(error => {
      console.error('Error creating form:', error);
      res.status(500).json({
        message: 'Creating insurance form failed!'
      });
    });
});

app.put('/api/insurance-forms/:id', (req, res) => {
  console.log("Attempting to update insurance form with ID:", req.params.id);
  console.log("Update data received:", req.body);
  
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
  
  console.log("Cleaned update data:", updateData);
  
  // Use update instead of findByIdAndUpdate to troubleshoot
  InsuranceForm.updateOne(
    { _id: formId },
    { $set: updateData }
  )
    .then(result => {
      console.log("Update result:", result);
      
      if (result.matchedCount === 0) {
        console.log("No insurance form found with ID:", formId);
        return res.status(404).json({ 
          message: 'Insurance form not found!',
          id: formId
        });
      }
      
      if (result.modifiedCount === 0) {
        console.log("No changes were made to the insurance form");
      } else {
        console.log("Insurance form updated successfully");
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
  InsuranceForm.deleteOne({ _id: req.params.id })
    .then(result => {
      res.status(200).json({ message: 'Insurance form deleted!' });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Deleting insurance form failed!'
      });
    });
});

// API routes for medical reports
app.get('/api/medical-reports', (req, res) => {
  MedicalReport.find()
    .then(documents => {
      res.status(200).json({
        message: 'Medical reports fetched successfully!',
        medicalReports: documents
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching medical reports failed!'
      });
    });
});

// Route for getting medical reports by patient ID - MUST come BEFORE the /:id route
app.get('/api/medical-reports/patient/:patientId', (req, res) => {
  console.log("Getting medical reports for patient:", req.params.patientId);
  MedicalReport.find({ patientId: req.params.patientId })
    .then(documents => {
      res.status(200).json({
        message: 'Medical reports for patient fetched successfully!',
        medicalReports: documents
      });
    })
    .catch(error => {
      console.error("Error fetching patient medical reports:", error);
      res.status(500).json({
        message: 'Fetching medical reports failed!'
      });
    });
});

// Routes for specific medical report by ID
app.get('/api/medical-reports/:id', (req, res) => {
  MedicalReport.findById(req.params.id)
    .then(report => {
      if (report) {
        res.status(200).json(report);
      } else {
        res.status(404).json({ message: 'Medical report not found!' });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Fetching medical report failed!'
      });
    });
});

app.post('/api/medical-reports', (req, res) => {
  const medicalReport = new MedicalReport(req.body);
  medicalReport.save()
    .then(createdReport => {
      res.status(201).json({
        message: 'Medical report added successfully',
        reportId: createdReport._id
      });
    })
    .catch(error => {
      console.error('Error creating report:', error);
      res.status(500).json({
        message: 'Creating medical report failed!'
      });
    });
});

app.put('/api/medical-reports/:id', (req, res) => {
  console.log("Attempting to update medical report with ID:", req.params.id);
  console.log("Update data:", req.body);
  
  // Use findByIdAndUpdate for better handling, similar to the insurance forms
  MedicalReport.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .then(updatedReport => {
      if (!updatedReport) {
        console.log("Medical report not found for update");
        return res.status(404).json({ message: 'Medical report not found!' });
      }
      console.log("Medical report updated successfully:", updatedReport);
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
  MedicalReport.deleteOne({ _id: req.params.id })
    .then(result => {
      res.status(200).json({ message: 'Medical report deleted!' });
    })
    .catch(error => {
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