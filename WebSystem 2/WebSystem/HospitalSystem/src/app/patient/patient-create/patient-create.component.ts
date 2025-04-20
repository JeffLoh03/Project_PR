/**
 * PatientCreateComponent
 * 
 * This component handles both creating new patients and editing existing ones.
 * It contains a form for user input and validation logic to ensure data quality.
 */
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
// Import Angular Material modules for UI components
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Router } from '@angular/router';
// Import the Patient model which defines the structure of patient data
import { Patient } from '../patient.model';
// Import the PatientService which handles API communication
import { PatientService } from '../patient.service';
// Import the PatientListComponent to display existing patients
import { PatientListComponent } from '../patient-list/patient-list.component';

@Component({
  selector: 'app-patient-create', // HTML selector used to embed this component
  standalone: true, // This is a standalone component (Angular 14+ feature)
  imports: [
    // Import all modules needed by this component
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    PatientListComponent
  ],
  templateUrl: './patient-create.component.html', // HTML template file
  styleUrls: ['./patient-create.component.css']   // CSS styles file
})
export class PatientCreateComponent {
  @ViewChild('form') patientForm!: NgForm;
  
  // Initialize a new Patient object with empty/default values
  patient: Patient = {
    regId: '',
    patientId: '',
    name: '',
    age: undefined,
    gender: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: '',
    dateOfBirth: undefined,
    allergy: '',
    medicalHistory: '',
    insurance: ''
  };
  // List of blood groups for the dropdown selection
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']; 
  // Flag to track if form is currently being submitted
  isSubmitting = false;
  // Variable to store error messages
  errorMessage = '';
  // Flag to track if we're editing an existing patient (vs. creating new)
  isEditing = false;

  /**
   * Constructor - runs when component is created
   * @param patientService - Service to communicate with backend API
   * @param router - Angular's router for navigation
   */
  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  /**
   * Display detailed view of patient information
   * @param patient - The patient object to view
   */
  viewPatient(patient: Patient) {
    // Format patient data for display
    let message = `
    Patient Details:\n
    Registration ID: ${patient.regId}\n
    Patient ID: ${patient.patientId}\n
    Name: ${patient.name}\n
    Age: ${patient.age}\n
    Gender: ${patient.gender}\n
    Phone: ${patient.phone}\n
    Email: ${patient.email}\n
    Address: ${patient.address}\n
    Blood Group: ${patient.bloodGroup}\n
    Date of Birth: ${patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}\n
    Allergies: ${patient.allergy || 'None'}\n
    Medical History: ${patient.medicalHistory || 'None'}\n
    Insurance: ${patient.insurance || 'None'}
    `;
    
    // Display the formatted information
    alert(message);
  }

  /**
   * Save or update patient data
   * This method is called when the form is submitted
   */
  onSavePatient() {
    // First validate all form inputs
    if (!this.validateForm()) {
      return; // Stop if validation fails
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    
    try {
      if (this.isEditing) {
        // Update existing patient in database
        this.patientService.updatePatient(this.patient);
        
        // Show success message to user
        alert("Patient Updated Successfully");
      } else {
        // Add new patient to database
        this.patientService.addPatient(this.patient);
        
        // Show success message to user
        alert("Patient Registration Successful");
      }
      
      // Reset form after successful submission
      this.resetForm();
    } catch (error) {
      // Handle any errors that occur during save/update
      console.error('Error saving patient:', error);
      this.errorMessage = this.isEditing ? 
        'Failed to update patient. Please try again.' :
        'Failed to register patient. Please try again.';
      this.isSubmitting = false;
    }
  }

  /**
   * Called when user clicks "Edit" button for a patient
   * @param patient - The patient object to edit
   */
  onEditPatient(patient: Patient) {
    // Enable edit mode
    this.isEditing = true;
    
    // Copy patient data to form
    // Using {...patient} creates a clone to avoid modifying original data
    this.patient = {...patient};
    
    // Scroll to the top of the page where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Reset the form to its initial state
   * Called after successful submission or when canceling edit
   */
  resetForm() {
    // Reset all form fields to empty values
    this.patient = {
      regId: '',
      patientId: '',
      name: '',
      age: undefined,
      gender: '',
      phone: '',
      email: '',
      address: '',
      bloodGroup: '',
      dateOfBirth: undefined,
      allergy: '',
      medicalHistory: '',
      insurance: ''
    };
    
    // Reset form validation state (this will clear touched/dirty flags)
    if (this.patientForm) {
      this.patientForm.resetForm();
    }
    
    // Exit edit mode
    this.isEditing = false;
    this.isSubmitting = false;
  }

  /**
   * Cancel editing and return to creation mode
   */
  cancelEdit() {
    this.resetForm();
  }

  /**
   * Validate all form fields before submission
   * @returns boolean - true if all validations pass, false otherwise
   */
  validateForm(): boolean {
    // Check that Registration ID is provided
    if (!this.patient.regId) {
      alert("Please enter Registration ID");
      return false;
    }
    
    // Validate Registration ID format (REG followed by 4 digits)
    // The /^REG\d{4}$/ is a regular expression pattern:
    // ^ - Start of string
    // REG - Literal "REG" characters
    // \d{4} - Exactly 4 digits
    // $ - End of string
    const regIdPattern = /^REG\d{4}$/;
    if (!regIdPattern.test(this.patient.regId)) {
      alert("Registration ID must follow the format 'REG' followed by 4 numbers (e.g., REG1234)");
      return false;
    }
    
    // Check that Patient ID is provided
    if (!this.patient.patientId) {
      alert("Please enter Patient ID");
      return false;
    }
    
    // Validate Patient ID format (P followed by 4 digits)
    const patientIdPattern = /^P\d{4}$/;
    if (!patientIdPattern.test(this.patient.patientId)) {
      alert("Patient ID must follow the format 'P' followed by 4 numbers (e.g., P1234)");
      return false;
    }

    // Validate other required fields
    if (!this.patient.name) {
      alert("Please enter patient name");
      return false;
    }
    
    if (!this.patient.age) {
      alert("Please enter patient age");
      return false;
    }
    
    if (!this.patient.gender) {
      alert("Please select patient gender");
      return false;
    }
    
    if (!this.patient.phone) {
      alert("Please enter phone number");
      return false;
    }
    
    if (!this.patient.email) {
      alert("Please enter email address");
      return false;
    }
    
    if (!this.patient.address) {
      alert("Please enter patient address");
      return false;
    }
    
    if (!this.patient.bloodGroup) {
      alert("Please select blood group");
      return false;
    }
    
    if (!this.patient.dateOfBirth) {
      alert("Please enter date of birth");
      return false;
    }

    // If all validations pass, return true
    return true;
  }
}