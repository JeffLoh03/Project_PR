import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
// Import MedicalReportService
import { MedicalReportService } from './medical_report.service';
import { MedicalReport } from './medical_report.model';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-medical-report',
  templateUrl: './medical_report.component.html',
  styleUrls: ['./medical_report.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule
  ]
})
export class MedicalReportComponent implements OnInit {
  medicalReportForm: FormGroup;
  private currentReportId: string | null = null;
  medicalReports: MedicalReport[] = [];

  constructor(
    private medicalReportService: MedicalReportService, // Use the service
    private fb: FormBuilder
  ) {
    this.medicalReportForm = this.fb.group({
      reportId: ['', [Validators.required, Validators.pattern('M[0-9]{4}')]],
      patientId: ['', [Validators.required, Validators.pattern('P[0-9]{4}')]],
      doctorName: ['', Validators.required],
      reportDate: ['', Validators.required],
      diagnosis: ['', Validators.required],
      treatment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Set current date
    this.setCurrentDate();
    // Update current time display
    this.updateCurrentTime();
    
    // Set up timer for current time
    setInterval(() => {
      this.updateCurrentTime();
    }, 1000);

    // Load existing reports from database
    this.loadReportsFromDatabase();
  }

  private setCurrentDate(): void {
    const today = new Date();
    (this.medicalReportForm.get('reportDate') as FormControl)?.setValue(today.toISOString().split('T')[0]);
  }

  private updateCurrentTime(): void {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const currentTimeElement = document.getElementById('currentTime');
    if (currentTimeElement) {
      currentTimeElement.textContent = timeString;
    }
  }

  // Add getters for form controls to avoid type assertion in the template
  get diagnosisControl(): FormControl {
    return this.medicalReportForm.get('diagnosis') as FormControl;
  }

  get treatmentControl(): FormControl {
    return this.medicalReportForm.get('treatment') as FormControl;
  }

  // Methods for handling form functionality (save, update, delete, search)
  public clearForm(): void {
    // Reset form
    this.medicalReportForm.reset();
    
    // Set current date again
    this.setCurrentDate();

    // Hide update and delete buttons, show submit button
    const submitBtn = document.querySelector('.submit-btn') as HTMLElement;
    const updateBtn = document.querySelector('.update-btn') as HTMLElement;
    const deleteBtn = document.querySelector('.delete-btn') as HTMLElement;

    if (submitBtn) submitBtn.style.display = 'block';
    if (updateBtn) updateBtn.style.display = 'none';
    if (deleteBtn) deleteBtn.style.display = 'none';
    
    // Reset the current form ID
    this.currentReportId = null;
  }

  public saveForm(): void {
    // Validate form
    if (this.medicalReportForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.medicalReportForm.controls).forEach(field => {
        const control = this.medicalReportForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      
      alert('Please fill out all required fields correctly.');
      return;
    }

    // Get form data
    const formData = this.medicalReportForm.getRawValue();
    
    // Convert to MedicalReport object
    const medicalReport: MedicalReport = {
      reportId: formData.reportId, // Use the user-entered report ID
      patientId: formData.patientId,
      doctorName: formData.doctorName,
      reportDate: new Date(formData.reportDate),
      diagnosis: formData.diagnosis,
      treatment: formData.treatment
    };
    
    // Save the report to the database
    this.medicalReportService.addMedicalReport(medicalReport).subscribe(
      response => {
        console.log('Report saved to database:', response);
        alert('Medical report has been submitted successfully!');
        this.clearForm();
        this.loadReportsFromDatabase(); // Refresh the list
      },
      error => {
        console.error('Error saving report:', error);
        alert('Error saving report to database. Please try again.');
      }
    );
  }

  public updateForm(): void {
    if (!this.currentReportId) {
      alert('No report selected for update');
      return;
    }
    
    // Validate form
    if (this.medicalReportForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.medicalReportForm.controls).forEach(field => {
        const control = this.medicalReportForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      
      alert('Please fill out all required fields correctly.');
      return;
    }
    
    // Get form data
    const formData = this.medicalReportForm.getRawValue();
    
    // Convert to MedicalReport object
    const medicalReport: MedicalReport = {
      id: this.currentReportId,
      reportId: formData.reportId,
      patientId: formData.patientId,
      doctorName: formData.doctorName,
      reportDate: new Date(formData.reportDate),
      diagnosis: formData.diagnosis,
      treatment: formData.treatment
    };
    
    // Update report in database
    this.medicalReportService.updateMedicalReport(medicalReport).subscribe(
      response => {
        console.log('Report updated in database:', response);
        alert('Medical report has been updated successfully!');
        this.clearForm();
        this.loadReportsFromDatabase(); // Refresh the list
      },
      error => {
        console.error('Error updating report:', error);
        alert('Error updating report in database. Please try again.');
      }
    );
  }

  public deleteForm(): void {
    if (!this.currentReportId) {
      alert('No report selected for deletion');
      return;
    }
    
    if (confirm('Are you sure you want to delete this report?')) {
      // Delete from database
      this.medicalReportService.deleteMedicalReport(this.currentReportId).subscribe(
        response => {
          console.log('Report deleted from database:', response);
          alert('Medical report has been deleted successfully!');
          this.clearForm();
          this.loadReportsFromDatabase(); // Refresh the list
        },
        error => {
          console.error('Error deleting report:', error);
          alert('Error deleting report from database. Please try again.');
        }
      );
    }
  }

  public searchReports(): void {
    const searchInput = (document.getElementById('searchReport') as HTMLInputElement)?.value.toLowerCase();
    const reportItems = document.querySelectorAll('#formList .report-item'); // Changed from '#reportList' to '#formList'
    
    reportItems.forEach(item => {
      const reportItem = item as HTMLElement;
      const doctorName = reportItem.querySelector('.doctor-name')?.textContent?.toLowerCase() || '';
      const patientId = reportItem.querySelector('.patient-id')?.textContent?.toLowerCase() || '';
      
      if (doctorName.includes(searchInput) || patientId.includes(searchInput)) {
        reportItem.style.display = 'flex';
      } else {
        reportItem.style.display = 'none';
      }
    });
  }

  // Helper methods
  private loadReportsFromDatabase(): void {
    this.medicalReportService.getMedicalReports().subscribe(
      reports => {
        this.medicalReports = reports;
        // Clear the current list and rebuild it from database data
        const reportList = document.getElementById('formList'); // Changed from 'reportList' to 'formList'
        if (reportList) {
          reportList.innerHTML = '';
          reports.forEach(report => {
            this.addReportToListFromDB(report);
          });
        } else {
          console.error('Could not find element with ID "formList"');
        }
      },
      error => {
        console.error('Error loading reports:', error);
      }
    );
  }

  private addReportToListFromDB(report: MedicalReport): void {
    const reportList = document.getElementById('formList'); // Changed from 'reportList' to 'formList'
    if (!reportList) {
      console.error('Could not find element with ID "formList"');
      return;
    }
    
    const reportItem = document.createElement('div');
    reportItem.className = 'report-item';
    reportItem.setAttribute('data-id', report.id || '');
    
    reportItem.innerHTML = `
      <div class="report-item-icon">
        <i class="ri-file-list-3-line"></i>
      </div>
      <div class="report-item-details">
        <h4 class="report-id">Report ID: ${report.reportId}</h4>
        <p class="patient-id">Patient ID: ${report.patientId} | Date: ${report.reportDate.toLocaleDateString()}</p>
      </div>
      <div class="report-item-actions">
        <button class="edit-btn"><i class="ri-edit-line"></i></button>
        <button class="view-btn"><i class="ri-eye-line"></i></button>
        <button class="delete-btn-item"><i class="ri-delete-bin-line"></i></button>
      </div>
    `;
    
    // Add click event for editing
    const editBtn = reportItem.querySelector('.edit-btn');
    editBtn?.addEventListener('click', () => {
      this.loadReportForEdit(report.id || '');
    });
    
    // Add click event for viewing
    const viewBtn = reportItem.querySelector('.view-btn');
    viewBtn?.addEventListener('click', () => {
      this.viewReport(report.id || '');
    });
    
    // Add click event for deleting
    const deleteBtn = reportItem.querySelector('.delete-btn-item');
    deleteBtn?.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete this report?`)) {
        this.medicalReportService.deleteMedicalReport(report.id || '').subscribe(
          response => {
            console.log('Report deleted from database:', response);
            alert('Medical report has been deleted successfully!');
            this.loadReportsFromDatabase(); // Refresh the list
          },
          error => {
            console.error('Error deleting report:', error);
            alert('Error deleting report from database. Please try again.');
          }
        );
      }
    });
    
    reportList.prepend(reportItem);
  }

  private loadReportForEdit(id: string): void {
    this.medicalReportService.getMedicalReport(id).subscribe(
      report => {
        this.currentReportId = id;
        
        // Populate form with data from the server
        this.medicalReportForm.patchValue({
          reportId: report.reportId,
          patientId: report.patientId,
          doctorName: report.doctorName,
          reportDate: report.reportDate.toISOString().split('T')[0],
          diagnosis: report.diagnosis,
          treatment: report.treatment
        });
        
        // Show update and delete buttons, hide submit button
        const submitBtn = document.querySelector('.submit-btn') as HTMLElement;
        const updateBtn = document.querySelector('.update-btn') as HTMLElement;
        const deleteBtn = document.querySelector('.delete-btn') as HTMLElement;
        
        if (submitBtn) submitBtn.style.display = 'none';
        if (updateBtn) updateBtn.style.display = 'block';
        if (deleteBtn) deleteBtn.style.display = 'block';
      },
      error => {
        console.error('Error loading report:', error);
        alert('Error loading report details. Please try again.');
      }
    );
  }

  private viewReport(id: string): void {
    this.medicalReportService.getMedicalReport(id).subscribe(
      report => {
        // Format data for display
        let message = `
        Medical Report Details:\n
        Patient ID: ${report.patientId}\n
        Doctor Name: ${report.doctorName}\n
        Report Date: ${report.reportDate.toLocaleDateString()}\n
        Diagnosis: ${report.diagnosis}\n
        Treatment: ${report.treatment}
        `;
        
        alert(message);
      },
      error => {
        console.error('Error loading report details:', error);
        alert('Error loading report details. Please try again.');
      }
    );
  }

  // Generate a unique report ID with format R-YYYY-MMDD-XXXX where XXXX is a random 4-digit number
  private generateReportId(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    
    return `R-${year}-${month}${day}-${randomNum}`;
  }
}
