/**
 * Insurance Form Service
 * 
 * This service manages all communication with the backend API for insurance form operations.
 * It follows the same pattern as the MedicalReportService for consistency.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { InsuranceForm } from './insurance_form.model';

@Injectable({
  providedIn: 'root'  // This makes the service available throughout the application
})
export class InsuranceFormService {
  // Local cache of insurance forms
  private insuranceForms: InsuranceForm[] = [];
  
  // Subject to notify subscribers when insurance forms data changes
  private insuranceFormsUpdated = new Subject<InsuranceForm[]>();
  
  // Backend API URL for insurance form operations
  private apiUrl = 'http://localhost:3000/api/insurance-forms';

  /**
   * Constructor - initializes the service with HttpClient for API communication
   * @param http - Angular's HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Fetch all insurance forms from the backend
   * @returns Observable<InsuranceForm[]> - Stream of insurance form data
   */
  getInsuranceForms(): Observable<InsuranceForm[]> {
    return this.http
      .get<{ message: string; insuranceForms: any[] }>(this.apiUrl)
      .pipe(
        // Transform the response data to match our frontend model
        map(response => {
          return response.insuranceForms.map(form => {
            return {
              ...form,
              id: form._id,
              dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
              currentDate: form.currentDate ? new Date(form.currentDate) : new Date(),
              dateOfServices: form.dateOfServices ? new Date(form.dateOfServices) : undefined
            };
          });
        })
      );
  }

  /**
   * Get an observable to subscribe to insurance form data changes
   * @returns Observable<InsuranceForm[]> - Stream that emits when insurance forms data changes
   */
  getInsuranceFormUpdateListener() {
    // Return the Subject as an Observable (subscribers can only listen)
    return this.insuranceFormsUpdated.asObservable();
  }

  /**
   * Get a specific insurance form by ID
   * @param id - The MongoDB ID of the insurance form to retrieve
   * @returns Observable<InsuranceForm> - Stream containing the requested insurance form
   */
  getInsuranceForm(id: string): Observable<InsuranceForm> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(form => {
          // Log the raw data from server (helpful for debugging)
          console.log('Raw form from server:', form);
          
          // Transform the response to match our frontend model
          return {
            ...form,
            id: form._id,
            dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : new Date(),
            currentDate: form.currentDate ? new Date(form.currentDate) : new Date(),
            dateOfServices: form.dateOfServices ? new Date(form.dateOfServices) : new Date()
          };
        })
      );
  }

  /**
   * Add a new insurance form
   * @param insuranceForm - The insurance form data to save
   * @returns Observable with response containing success message and new form ID
   */
  addInsuranceForm(insuranceForm: InsuranceForm): Observable<{ message: string; formId: string }> {
    console.log('Sending form data to server:', insuranceForm);
    // Send POST request to backend API
    return this.http.post<{ message: string; formId: string }>(
      this.apiUrl,
      insuranceForm
    );
  }

  /**
   * Update an existing insurance form
   * @param insuranceForm - The updated insurance form data (must include ID)
   * @returns Observable with response containing success message
   */
  updateInsuranceForm(insuranceForm: InsuranceForm): Observable<{ message: string }> {
    console.log('Updating form with ID:', insuranceForm.id);
    // Send PUT request to backend API
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${insuranceForm.id || insuranceForm._id}`,
      insuranceForm
    );
  }

  /**
   * Delete an insurance form
   * @param formId - The ID of the insurance form to delete
   * @returns Observable with response containing success message
   */
  deleteInsuranceForm(formId: string): Observable<{ message: string }> {
    // Send DELETE request to backend API
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${formId}`);
  }

  /**
   * Get all insurance forms for a specific patient
   * @param patientId - The ID of the patient
   * @returns Observable<InsuranceForm[]> - Stream of insurance forms for the specified patient
   */
  getInsuranceFormsByPatient(patientId: string): Observable<InsuranceForm[]> {
    return this.http
      .get<{ message: string; insuranceForms: any[] }>(`${this.apiUrl}/patient/${patientId}`)
      .pipe(
        map(response => {
          return response.insuranceForms.map(form => {
            return {
              ...form,
              id: form._id,
              dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
              currentDate: form.currentDate ? new Date(form.currentDate) : new Date(),
              dateOfServices: form.dateOfServices ? new Date(form.dateOfServices) : undefined
            };
          });
        })
      );
  }
}