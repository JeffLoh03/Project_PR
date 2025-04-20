/**
 * Patient Service
 * 
 * This service handles all communication between the Angular application and the backend API
 * related to patient operations (fetch, create, update, delete).
 * It also includes fallback to local storage when the backend is unavailable.
 */
import { Injectable } from '@angular/core'; // Makes the service injectable to other components
import { HttpClient } from '@angular/common/http'; // For making HTTP requests to the backend
import { Subject, Observable, of } from 'rxjs'; // RxJS tools for handling asynchronous operations
import { map, tap, catchError } from 'rxjs/operators'; // RxJS operators for manipulating data streams
import { Patient } from './patient.model'; // The Patient data model

// @Injectable decorator marks this class as a service that can be injected into components
@Injectable({providedIn: 'root'}) // 'root' means this service is available throughout the app
export class PatientService {
    // Array to store patients locally (cache)
    private patients: Patient[] = [];
    // Subject to notify all subscribers when patients data changes
    private patientsUpdated = new Subject<Patient[]>();
    // Backend API URL for patient operations
    private apiUrl = 'http://localhost:3000/api/patients';
    // For generating IDs when using local storage fallback
    private nextId = 1;
    
    /**
     * Constructor - initialize the service with HttpClient for API communication
     * @param http - Angular's HttpClient service for making HTTP requests
     */
    constructor(private http: HttpClient) {}

    /**
     * Get a copy of the locally stored patients array
     * @returns Array of Patient objects
     */
    getPatients() {
        // Return a copy of the array using spread operator to avoid direct modification
        return [...this.patients];
    }

    /**
     * Fetch patients from the backend API
     * @returns Observable<Patient[]> - Stream of patient data that components can subscribe to
     */
    fetchPatients(): Observable<Patient[]> {
        // Make HTTP GET request to the backend API
        return this.http.get<{message: string, patients: any[]}>(this.apiUrl)
            .pipe(
                // Transform backend data to match our frontend model
                map(patientData => {
                    return patientData.patients.map(patient => {
                        return {
                            id: patient._id, // MongoDB uses _id, our frontend uses id
                            regId: patient.regId,
                            patientId: patient.patientId,
                            name: patient.name,
                            age: patient.age,
                            gender: patient.gender,
                            phone: patient.phone,
                            email: patient.email,
                            address: patient.address,
                            bloodGroup: patient.bloodGroup,
                            dateOfBirth: patient.dateOfBirth,
                            allergy: patient.allergy,
                            medicalHistory: patient.medicalHistory,
                            insurance: patient.insurance
                        };
                    });
                }),
                // Store the fetched data in our local cache and notify subscribers
                tap(transformedPatients => {
                    this.patients = transformedPatients;
                    this.patientsUpdated.next([...this.patients]);
                }),
                // Error handling - if API request fails, fall back to local data
                catchError(error => {
                    console.error('Error fetching patients:', error);
                    // Return local data as fallback using Observable.of
                    return of([...this.patients]);
                })
            );
    }

    /**
     * Get an observable to subscribe to patient data changes
     * @returns Observable<Patient[]> - Stream that emits when patients data changes
     */
    getPatientUpdateListener() {
        // Return the Subject as an Observable (subscribers can't emit, only listen)
        return this.patientsUpdated.asObservable();
    }

    /**
     * Add a new patient to the system
     * @param patient - The patient object to add
     */
    addPatient(patient: Patient) {
        // Send POST request to backend API
        this.http
            .post<{ message: string; patientId: string }>(this.apiUrl, patient)
            .subscribe(
                // Success handler
                (responseData) => {
                    // Backend generates and returns an ID for the new patient
                    const id = responseData.patientId;
                    patient.id = id;
                    // Add to local cache and notify subscribers
                    this.patients.push({...patient});
                    this.patientsUpdated.next([...this.patients]);
                    console.log(responseData.message);
                },
                // Error handler
                (error) => {
                    console.error('Error adding patient:', error);
                    // Fallback to local storage if backend fails
                    patient.id = 'local-' + this.nextId++; // Generate a temporary local ID
                    this.patients.push({...patient});
                    this.patientsUpdated.next([...this.patients]);
                }
            );
    }

    /**
     * Delete a patient by ID or index
     * @param patientIdOrIndex - Either a string ID or number index of the patient to delete
     */
    deletePatient(patientIdOrIndex: string | number) {
        // If a string ID is provided
        if (typeof patientIdOrIndex === 'string') {
            // Send DELETE request to backend API
            this.http.delete(this.apiUrl + '/' + patientIdOrIndex)
                .subscribe(
                    // Success handler
                    () => {
                        // Filter out the deleted patient from local cache
                        const updatedPatients = this.patients.filter(patient => patient.id !== patientIdOrIndex);
                        this.patients = updatedPatients;
                        this.patientsUpdated.next([...this.patients]);
                        console.log("Patient Deleted");
                    },
                    // Error handler
                    (error) => {
                        console.error('Error deleting patient:', error);
                        // Local fallback - remove from local cache even if API fails
                        const updatedPatients = this.patients.filter(patient => patient.id !== patientIdOrIndex);
                        this.patients = updatedPatients;
                        this.patientsUpdated.next([...this.patients]);
                    }
                );
        } else {
            // If a numeric index is provided instead of an ID
            if (this.patients[patientIdOrIndex]) {
                const patientId = this.patients[patientIdOrIndex].id;
                if (patientId) {
                    // If the patient at this index has an ID, delete by ID
                    this.deletePatient(patientId);
                } else {
                    // Otherwise delete by index
                    this.patients.splice(patientIdOrIndex, 1);
                    this.patientsUpdated.next([...this.patients]);
                }
            }
        }
    }

    /**
     * Get a specific patient by ID
     * @param patientId - The ID of the patient to retrieve
     * @returns Patient - A copy of the patient object
     */
    getPatient(patientId: string) {
        // Find the patient by ID and return a copy to prevent direct modification
        return {...this.patients.find(p => p.id === patientId)};
    }

    /**
     * Update an existing patient's information
     * @param patient - The updated patient object (must include ID)
     */
    updatePatient(patient: Patient) {
        // Send PUT request to backend API
        this.http.put(this.apiUrl + '/' + patient.id, patient)
            .subscribe(
                // Success handler
                response => {
                    // Create a copy of the patients array
                    const updatedPatients = [...this.patients];
                    // Find the position of the patient in the array
                    const oldPatientIndex = updatedPatients.findIndex(p => p.id === patient.id);
                    // Replace the old patient data with updated data
                    updatedPatients[oldPatientIndex] = patient;
                    // Update the local cache
                    this.patients = updatedPatients;
                    // Notify all subscribers
                    this.patientsUpdated.next([...this.patients]);
                    console.log("Patient Updated");
                },
                // Error handler
                error => {
                    console.error('Error updating patient:', error);
                    // Local fallback - update local cache even if API fails
                    const updatedPatients = [...this.patients];
                    const oldPatientIndex = updatedPatients.findIndex(p => p.id === patient.id);
                    updatedPatients[oldPatientIndex] = patient;
                    this.patients = updatedPatients;
                    this.patientsUpdated.next([...this.patients]);
                }
            );
    }
}