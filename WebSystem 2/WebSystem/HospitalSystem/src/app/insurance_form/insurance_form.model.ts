/**
 * Insurance Form Model Interface
 * 
 * Simplified model with only required fields as specified
 */
export interface InsuranceForm {
  // MongoDB-generated unique identifier (optional for new forms)
  id?: string;
  
  // MongoDB _id field (used for updates)
  _id?: string;
  
  // Form Information
  formId: string;
  currentDate?: Date;
  
  // Patient Information
  patientId: string;
  patientName?: string;
  dateOfBirth?: Date;
  gender?: string;
  contactNumber?: string;
  
  // Insurance Information
  insuranceCompany?: string;
  policyNumber: string;
  
  // Billing Information
  totalCharges?: number;
  amountPaidByPatient?: number;
  
  // Additional notes
  additionalNotes?: string;
}