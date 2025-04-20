/**
 * Patient Model Interface
 * 
 * This interface defines the structure of Patient objects used throughout the application.
 * It establishes the data types for each field and whether they're optional (with the ? symbol).
 * This ensures type safety and consistency across your Hospital Management System.
 */
export interface Patient {
    // MongoDB-generated unique identifier (optional because it's not present when creating a new patient)
    id?: string;
    
    // Registration ID in format REG + 4 digits (e.g., REG1234)
    regId?: string;
    
    // Patient ID in format P + 4 digits (e.g., P1234)
    patientId?: string;
    
    // Full name of the patient
    name?: string;
    
    // Patient's age as a number
    age?: number;
    
    // Patient's gender (Male, Female, Other)
    gender?: string;
    
    // Contact phone number
    phone?: string;
    
    // Email address for correspondence
    email?: string;
    
    // Physical address of the patient
    address?: string;
    
    // Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
    bloodGroup?: string;
    
    // Date of birth - can be a Date object or string depending on context
    dateOfBirth?: Date | string;
    
    // Alternative field for date of birth (used in some components)
    dob?: Date | string;
    
    // Information about patient allergies (medications, food, etc.)
    allergy?: string;
    
    // Patient's past medical history information
    medicalHistory?: string;
    
    // Insurance provider or policy information
    insurance?: string;
}