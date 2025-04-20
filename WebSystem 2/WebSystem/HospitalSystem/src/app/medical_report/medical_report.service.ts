/**
 * Medical Report Service
 * 
 * This service manages all communication with the backend API for medical report operations.
 * It handles creating, reading, updating, and deleting medical reports, as well as 
 * retrieving reports for specific patients.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { MedicalReport } from './medical_report.model';

@Injectable({
  providedIn: 'root'  // This makes the service available throughout the application
})
export class MedicalReportService {
  // Local cache of medical reports
  private medicalReports: MedicalReport[] = [];
  
  // Subject to notify subscribers when medical reports data changes
  private medicalReportsUpdated = new Subject<MedicalReport[]>();
  
  // Backend API URL for medical report operations
  private apiUrl = 'http://localhost:3000/api/medical-reports';

  /**
   * Constructor - initializes the service with HttpClient for API communication
   * @param http - Angular's HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Fetch all medical reports from the backend
   * @returns Observable<MedicalReport[]> - Stream of medical report data
   */
  getMedicalReports(): Observable<MedicalReport[]> {
    return this.http
      .get<{ message: string; medicalReports: any[] }>(this.apiUrl)
      .pipe(
        // Transform the response data to match our frontend model
        map(response => {
          return response.medicalReports.map(report => {
            return {
              ...report,
              id: report._id,  // Convert MongoDB _id to our frontend id
              // Convert date string to Date object
              reportDate: new Date(report.reportDate)
            };
          });
        })
      );
  }

  /**
   * Get an observable to subscribe to medical report data changes
   * @returns Observable<MedicalReport[]> - Stream that emits when medical reports data changes
   */
  getMedicalReportUpdateListener() {
    // Return the Subject as an Observable (subscribers can only listen)
    return this.medicalReportsUpdated.asObservable();
  }

  /**
   * Get a specific medical report by ID
   * @param id - The MongoDB ID of the medical report to retrieve
   * @returns Observable<MedicalReport> - Stream containing the requested medical report
   */
  getMedicalReport(id: string): Observable<MedicalReport> {
    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(report => {
          // Log the raw data from server (helpful for debugging)
          console.log('Raw report from server:', report);
          
          // Transform the response to match our frontend model
          return {
            ...report,
            id: report._id,
            // Convert date string to Date object or provide default
            reportDate: report.reportDate ? new Date(report.reportDate) : new Date()
          };
        })
      );
  }

  /**
   * Add a new medical report
   * @param medicalReport - The medical report data to save
   * @returns Observable with response containing success message and new report ID
   */
  addMedicalReport(medicalReport: MedicalReport): Observable<{ message: string; reportId: string }> {
    // Send POST request to backend API
    return this.http.post<{ message: string; reportId: string }>(
      this.apiUrl,
      medicalReport
    );
  }

  /**
   * Update an existing medical report
   * @param medicalReport - The updated medical report data (must include ID)
   * @returns Observable with response containing success message
   */
  updateMedicalReport(medicalReport: MedicalReport): Observable<{ message: string }> {
    // Send PUT request to backend API
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${medicalReport.id}`,
      medicalReport
    );
  }

  /**
   * Delete a medical report
   * @param reportId - The ID of the medical report to delete
   * @returns Observable with response containing success message
   */
  deleteMedicalReport(reportId: string): Observable<{ message: string }> {
    // Send DELETE request to backend API
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${reportId}`);
  }

  /**
   * Get all medical reports for a specific patient
   * @param patientId - The ID of the patient
   * @returns Observable<MedicalReport[]> - Stream of medical reports for the specified patient
   */
  getMedicalReportsByPatient(patientId: string): Observable<MedicalReport[]> {
    return this.http
      .get<{ message: string; medicalReports: any[] }>(`${this.apiUrl}/patient/${patientId}`)
      .pipe(
        map(response => {
          return response.medicalReports.map(report => {
            return {
              ...report,
              id: report._id,
              reportDate: new Date(report.reportDate)
            };
          });
        })
      );
  }
}