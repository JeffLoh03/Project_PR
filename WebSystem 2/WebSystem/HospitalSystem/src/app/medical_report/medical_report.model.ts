/**
 * Medical Report Model Interface
 * 
 * This interface defines the structure of medical reports in the hospital system.
 * It specifies the required and optional fields along with their data types.
 * This provides a consistent structure for storing and retrieving medical report data.
 */
export interface MedicalReport {
    // MongoDB-generated unique identifier (optional for new reports)
    id?: string;
    
    // Custom report identifier (e.g., format like "R-YYYY-MMDD-XXXX")
    reportId: string;
    
    // ID of the patient this report belongs to (format: P + 4 digits)
    patientId: string;
    
    // Full name of the doctor who created this report
    doctorName: string;
    
    // Date when the report was created
    reportDate: Date;
    
    // Medical diagnosis provided by the doctor
    diagnosis: string;
    
    // Recommended treatment plan for the patient
    treatment: string;
  }
