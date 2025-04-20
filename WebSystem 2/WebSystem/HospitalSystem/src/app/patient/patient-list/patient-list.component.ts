import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, catchError, of } from 'rxjs';
import { Patient } from '../patient.model';
import { PatientService } from '../patient.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit, OnDestroy {
  // Add output event to communicate with parent components
  @Output() editPatientEvent = new EventEmitter<Patient>();
  @Output() viewPatientEvent = new EventEmitter<Patient>();
  
  patients: Patient[] = [];
  displayedColumns: string[] = ['regId', 'name', 'phone', 'bloodGroup', 'actions'];
  searchTerm: string = '';
  private patientsSub: Subscription = new Subscription();
  isLoading = false;
  errorMessage: string = '';

  // Example patients for reference
  examplePatients: Patient[] = [
    {
      id: 'example-1',
      regId: 'REG1001',
      patientId: 'P1001',
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      phone: '555-123-4567',
      email: 'john.smith@example.com',
      address: '123 Main St, Anytown',
      bloodGroup: 'O+',
      dateOfBirth: new Date('1980-05-15'),
      allergy: 'Penicillin',
      medicalHistory: 'Hypertension',
      insurance: 'Medicare'
    },
    {
      id: 'example-2',
      regId: 'REG1002',
      patientId: 'P1002',
      name: 'Sarah Johnson',
      age: 32,
      gender: 'Female',
      phone: '555-987-6543',
      email: 'sarah.j@example.com',
      address: '456 Oak Ave, Sometown',
      bloodGroup: 'A+',
      dateOfBirth: new Date('1993-08-22'),
      allergy: 'None',
      medicalHistory: 'Asthma',
      insurance: 'Blue Cross'
    },
    {
      id: 'example-3',
      regId: 'REG1003',
      patientId: 'P1003',
      name: 'Michael Brown',
      age: 58,
      gender: 'Male',
      phone: '555-456-7890',
      email: 'michael.b@example.com',
      address: '789 Pine St, Othertown',
      bloodGroup: 'AB-',
      dateOfBirth: new Date('1967-11-03'),
      allergy: 'Sulfa drugs',
      medicalHistory: 'Diabetes Type 2',
      insurance: 'Aetna'
    }
  ];

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    // Load example data if no patients exist
    if (this.patientService.getPatients().length === 0) {
      // Add example patients to the service
      this.examplePatients.forEach(patient => {
        this.patientService.addPatient({...patient});
      });
    }
    
    // Get initial list of patients
    this.patients = this.patientService.getPatients();
    
    // Subscribe to updates
    this.patientsSub = this.patientService.getPatientUpdateListener()
      .subscribe(patients => {
        this.patients = patients;
        this.isLoading = false;
      });
      
    // Load patients (now from local storage)
    this.loadPatients();
  }

  loadPatients() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Use the service's fetchPatients method
    this.patientService.fetchPatients()
      .pipe(
        catchError(error => {
          console.error('Error fetching patients:', error);
          this.errorMessage = 'Unable to load patient data. Please try again.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe(
        patients => {
          this.patients = patients;
          this.isLoading = false;
        }
      );
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.patientsSub) {
      this.patientsSub.unsubscribe();
    }
  }

  // Filter patients based on search term
  filteredPatients() {
    if (!this.searchTerm) {
      return this.patients;
    }
    return this.patients.filter(patient => 
      patient.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Delete patient by index
  deletePatient(index: number) {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.patientService.deletePatient(index);
    }
  }

  // Add edit patient method
  editPatient(patient: Patient) {
    // Make a copy of the patient object to avoid reference issues
    const patientToEdit = {...patient};
    console.log('Editing patient:', patientToEdit);
    
    // Emit the patient to be edited to the parent component
    this.editPatientEvent.emit(patientToEdit);
  }

  // View patient method
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
    
    // Also emit an event for parent components that might need it
    this.viewPatientEvent.emit({...patient});
  }
}