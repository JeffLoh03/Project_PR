import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InsuranceFormService } from './insurance_form.service';
import { InsuranceForm } from './insurance_form.model';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { TextFieldModule } from '@angular/cdk/text-field';

@Component({
  selector: 'app-insurance-form',
  templateUrl: './insurance_form.component.html',
  styleUrls: ['./insurance_form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    TextFieldModule
  ],
  providers: [InsuranceFormService]
})
export class InsuranceFormComponent implements OnInit {
  insuranceForm: FormGroup;
  private currentFormId: string | null = null;
  insuranceForms: InsuranceForm[] = [];
  
  constructor(
    private insuranceFormService: InsuranceFormService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.insuranceForm = this.fb.group({
      // Form Information
      formId: ['', [Validators.required, Validators.pattern('I[0-9]{4}')]],
      currentDate: ['', Validators.required],
      
      // Patient Information
      patientId: ['', [Validators.required, Validators.pattern('P[0-9]{4}')]],
      patientName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('[0-9]{10,11}')]],
      
      // Insurance Information
      insuranceCompany: ['', Validators.required],
      policyNumber: ['', [Validators.required, Validators.pattern('[A-Za-z0-9]{12}')]],
      
      // Billing Information
      totalCharges: ['', Validators.required],
      amountPaidByPatient: ['', Validators.required],
      
      // Additional Notes
      additionalNotes: [''] // Optional field, no validators
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

    // Load existing forms from database
    this.loadFormsFromDatabase();
  }

  private setCurrentDate(): void {
    const today = new Date();
    this.insuranceForm.get('currentDate')?.setValue(this.formatDateForInput(today));
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
  get additionalNotesControl(): FormControl {
    return this.insuranceForm.get('additionalNotes') as FormControl;
  }

  // Methods for handling form functionality (save, update, delete, search)
  clearForm(): void {
    // Reset form
    this.insuranceForm.reset();
    
    // Set current date
    this.setCurrentDate();

    // Hide update and delete buttons, show submit button
    const submitBtn = document.querySelector('.submit-btn') as HTMLElement;
    const updateBtn = document.querySelector('.update-btn') as HTMLElement;
    const deleteBtn = document.querySelector('.delete-btn') as HTMLElement;

    if (submitBtn) submitBtn.style.display = 'block';
    if (updateBtn) updateBtn.style.display = 'none';
    if (deleteBtn) deleteBtn.style.display = 'none';
    
    // Reset the current form ID
    this.currentFormId = null;
  }

  saveForm(): void {
    // Validate form
    if (this.insuranceForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.insuranceForm.controls).forEach(field => {
        const control = this.insuranceForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      
      // Using alert instead of snackBar for validation errors to match medical report style
      alert('Please fill out all required fields correctly.');
      return;
    }

    // Get form data
    const formData = this.insuranceForm.getRawValue();
    
    // Convert to InsuranceForm object
    const insuranceForm: InsuranceForm = {
      formId: formData.formId,
      currentDate: new Date(formData.currentDate),
      patientId: formData.patientId,
      patientName: formData.patientName,
      dateOfBirth: new Date(formData.dateOfBirth),
      gender: formData.gender,
      contactNumber: formData.contactNumber,
      insuranceCompany: formData.insuranceCompany,
      policyNumber: formData.policyNumber,
      totalCharges: parseFloat(formData.totalCharges),
      amountPaidByPatient: parseFloat(formData.amountPaidByPatient),
      additionalNotes: formData.additionalNotes
    };
    
    // Save the form to the database
    this.insuranceFormService.addInsuranceForm(insuranceForm).subscribe(
      response => {
        console.log('Form saved to database:', response);
        alert('Insurance form has been submitted successfully!');
        this.clearForm();
        this.loadFormsFromDatabase(); // Refresh the list
      },
      error => {
        console.error('Error saving form:', error);
        alert('Error saving form to database. Please try again.');
      }
    );
  }

  updateForm(): void {
    if (!this.currentFormId) {
      alert('No form selected for update');
      return;
    }
    
    // Validate form
    if (this.insuranceForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.insuranceForm.controls).forEach(field => {
        const control = this.insuranceForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
      
      alert('Please fill out all required fields correctly.');
      return;
    }
    
    // Get form data
    const formData = this.insuranceForm.getRawValue();
    
    // Convert to InsuranceForm object
    const insuranceForm: InsuranceForm = {
      id: this.currentFormId,
      formId: formData.formId,
      currentDate: new Date(formData.currentDate),
      patientId: formData.patientId,
      patientName: formData.patientName,
      dateOfBirth: new Date(formData.dateOfBirth),
      gender: formData.gender,
      contactNumber: formData.contactNumber,
      insuranceCompany: formData.insuranceCompany,
      policyNumber: formData.policyNumber,
      totalCharges: parseFloat(formData.totalCharges),
      amountPaidByPatient: parseFloat(formData.amountPaidByPatient),
      additionalNotes: formData.additionalNotes
    };
    
    // Update form in database
    this.insuranceFormService.updateInsuranceForm(insuranceForm).subscribe(
      response => {
        console.log('Form updated in database:', response);
        alert('Insurance form has been updated successfully!');
        this.clearForm();
        this.loadFormsFromDatabase(); // Refresh the list
      },
      error => {
        console.error('Error updating form:', error);
        alert('Error updating form in database. Please try again.');
      }
    );
  }

  deleteForm(): void {
    if (!this.currentFormId) {
      alert('No form selected for deletion');
      return;
    }
    
    if (confirm('Are you sure you want to delete this form?')) {
      // Delete from database
      this.insuranceFormService.deleteInsuranceForm(this.currentFormId).subscribe(
        response => {
          console.log('Form deleted from database:', response);
          alert('Insurance form has been deleted successfully!');
          this.clearForm();
          this.loadFormsFromDatabase(); // Refresh the list
        },
        error => {
          console.error('Error deleting form:', error);
          alert('Error deleting form from database. Please try again.');
        }
      );
    }
  }

  searchForms(): void {
    const searchInput = (document.getElementById('searchForm') as HTMLInputElement)?.value.toLowerCase();
    const formItems = document.querySelectorAll('#formList .form-item');
    
    formItems.forEach(item => {
      const formItem = item as HTMLElement;
      const patientName = formItem.querySelector('.patient-name')?.textContent?.toLowerCase() || '';
      const policyDetails = formItem.querySelector('.policy-details')?.textContent?.toLowerCase() || '';
      
      if (patientName.includes(searchInput) || policyDetails.includes(searchInput)) {
        formItem.style.display = 'flex';
      } else {
        formItem.style.display = 'none';
      }
    });
  }

  // Helper methods
  private loadFormsFromDatabase(): void {
    this.insuranceFormService.getInsuranceForms().subscribe(
      forms => {
        this.insuranceForms = forms;
        // Clear the current list and rebuild it from database data
        const formList = document.getElementById('formList');
        if (formList) {
          formList.innerHTML = '';
          forms.forEach(form => {
            this.addFormToListFromDB(form);
          });
        } else {
          console.error('Could not find element with ID "formList"');
        }
      },
      error => {
        console.error('Error loading forms:', error);
      }
    );
  }

  private addFormToListFromDB(form: InsuranceForm): void {
    const formList = document.getElementById('formList');
    if (!formList) {
      console.error('Could not find element with ID "formList"');
      return;
    }
    
    const formItem = document.createElement('div');
    formItem.className = 'form-item';
    formItem.setAttribute('data-id', form.id || '');
    
    formItem.innerHTML = `
      <div class="form-item-icon">
        <i class="ri-file-list-3-line"></i>
      </div>
      <div class="form-item-details">
        <h4 class="patient-name">${form.patientName || 'Unknown Patient'}</h4>
        <p class="policy-details">Policy: ${form.policyNumber} | Date: ${form.currentDate ? new Date(form.currentDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
      </div>
      <div class="form-item-actions">
        <button class="edit-btn"><i class="ri-edit-line"></i></button>
        <button class="view-btn"><i class="ri-eye-line"></i></button>
        <button class="delete-btn-item"><i class="ri-delete-bin-line"></i></button>
      </div>
    `;
    
    // Add click event for editing
    const editBtn = formItem.querySelector('.edit-btn');
    editBtn?.addEventListener('click', () => {
      this.loadFormForEdit(form.id || '');
    });
    
    // Add click event for viewing
    const viewBtn = formItem.querySelector('.view-btn');
    viewBtn?.addEventListener('click', () => {
      this.viewForm(form.id || '');
    });
    
    // Add click event for deleting
    const deleteBtn = formItem.querySelector('.delete-btn-item');
    deleteBtn?.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete this form?`)) {
        this.insuranceFormService.deleteInsuranceForm(form.id || '').subscribe(
          response => {
            console.log('Form deleted from database:', response);
            alert('Insurance form has been deleted successfully!');
            this.loadFormsFromDatabase(); // Refresh the list
          },
          error => {
            console.error('Error deleting form:', error);
            alert('Error deleting form from database. Please try again.');
          }
        );
      }
    });
    
    formList.prepend(formItem);
  }

  private loadFormForEdit(id: string): void {
    this.insuranceFormService.getInsuranceForm(id).subscribe(
      form => {
        this.currentFormId = id;
        
        // Populate form with data from the server
        this.insuranceForm.patchValue({
          formId: form.formId,
          currentDate: this.formatDateForInput(form.currentDate),
          patientId: form.patientId,
          patientName: form.patientName,
          dateOfBirth: this.formatDateForInput(form.dateOfBirth),
          gender: form.gender,
          contactNumber: form.contactNumber,
          insuranceCompany: form.insuranceCompany,
          policyNumber: form.policyNumber,
          totalCharges: form.totalCharges,
          amountPaidByPatient: form.amountPaidByPatient,
          additionalNotes: form.additionalNotes
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
        console.error('Error loading form:', error);
        alert('Error loading form details. Please try again.');
      }
    );
  }

  private viewForm(id: string): void {
    this.insuranceFormService.getInsuranceForm(id).subscribe(
      form => {
        // Format data for display
        let message = `
        Insurance Form Details:\n
        Form ID: ${form.formId}\n
        Patient Information:
        - Patient ID: ${form.patientId}
        - Patient Name: ${form.patientName || 'N/A'}
        - Date of Birth: ${form.dateOfBirth ? new Date(form.dateOfBirth).toLocaleDateString() : 'N/A'}
        - Gender: ${form.gender || 'N/A'}
        - Contact Number: ${form.contactNumber || 'N/A'}\n
        Insurance Information:
        - Company: ${form.insuranceCompany || 'N/A'}
        - Policy Number: ${form.policyNumber || 'N/A'}\n
        Billing Information:
        - Total Charges: $${form.totalCharges || '0'}
        - Amount Paid by Patient: $${form.amountPaidByPatient || '0'}\n
        Additional Notes:
        ${form.additionalNotes || 'No additional notes'}\n
        Form Date: ${form.currentDate ? new Date(form.currentDate).toLocaleDateString() : new Date().toLocaleDateString()}
        `;
        
        alert(message);
      },
      error => {
        console.error('Error loading form details:', error);
        alert('Error loading form details. Please try again.');
      }
    );
  }
  
  // Helper method to format dates for input fields
  private formatDateForInput(date: Date | undefined): string {
    if (!date) {
      return '';
    }
    
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
