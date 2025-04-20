import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-insurance-form',
  templateUrl: './insurance-form.component.html',
  styleUrls: ['./insurance-form.component.css']
})
export class InsuranceFormComponent implements OnInit {
  insuranceForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.insuranceForm = this.fb.group({
      patientId: ['', Validators.required],
      patientName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required],
      contactNumber: ['', Validators.required],
      currentDate: [new Date(), Validators.required],
      insuranceCompany: ['', Validators.required],
      policyNumber: ['', Validators.required],
      nameOfInsured: ['', Validators.required],
      relationship: [''],
      medicalReportId: ['', Validators.required],
      descriptionOfServices: ['', Validators.required],
      dateOfServices: ['', Validators.required],
      totalCharges: [0, Validators.required],
      amountPaidByPatient: [0],
      additionalNotes: ['']
    });
  }

  editInsuranceForm(insuranceData: any): void {
    this.insuranceForm.patchValue({
      patientId: insuranceData.patientId,
      patientName: insuranceData.patientName,
      dateOfBirth: insuranceData.dateOfBirth,
      gender: insuranceData.gender,
      address: insuranceData.address,
      contactNumber: insuranceData.contactNumber,
      currentDate: insuranceData.currentDate || new Date(),
      insuranceCompany: insuranceData.insuranceCompany,
      policyNumber: insuranceData.policyNumber,
      nameOfInsured: insuranceData.nameOfInsured,
      relationship: insuranceData.relationship,
      medicalReportId: insuranceData.medicalReportId,
      descriptionOfServices: insuranceData.descriptionOfServices,
      dateOfServices: insuranceData.dateOfServices,
      totalCharges: insuranceData.totalCharges,
      amountPaidByPatient: insuranceData.amountPaidByPatient,
      additionalNotes: insuranceData.additionalNotes
    });
  }

  // ...other methods...
}