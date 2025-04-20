/**
 * Application Routes Configuration
 * 
 * This file defines all the routes (URLs) available in your Hospital Management System.
 * Each route maps a URL path to a specific component that will be displayed when that URL is accessed.
 * This is what enables navigation between different sections of your application.
 */
import { Routes } from '@angular/router';
import { PatientCreateComponent } from './patient/patient-create/patient-create.component';
import { PatientListComponent } from './patient/patient-list/patient-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InsuranceFormComponent } from './insurance_form/insurance_form.component';
import { MedicalReportComponent } from './medical_report/medical_report.component';

/**
 * Routes array - defines all available routes in the application
 * 
 * Each route object has:
 * - path: The URL segment that will activate this route (e.g., 'patient' for '/patient')
 * - component: The component to display when this route is active
 */
export const routes: Routes = [
    // Root path - when user visits the base URL (e.g., http://localhost:4200/)
    { path: '', component: DashboardComponent },  // Shows the dashboard as the home page
    
    // Patient registration route - when user visits /patient
    { path: 'patient', component: PatientCreateComponent },  // Shows the patient registration form
    
    // Patient list route - when user visits /patient/list
    { path: 'patient/list', component: PatientListComponent },  // Shows the list of patients
    
    // Medical reports route - when user visits /medical-report
    { path: 'medical-report', component: MedicalReportComponent },  // Shows medical report management
    
    // Insurance forms route - when user visits /insurance-form
    { path: 'insurance-form', component: InsuranceFormComponent }   // Shows insurance form management
];
