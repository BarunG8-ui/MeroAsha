# MeroAsha Hospital Management System
## Requirements Document

## 1. Project Overview

MeroAsha is a hospital management system designed to digitally manage
hospital operations, patients, doctors, appointments, medical records,
laboratory services, pharmacy, blood bank, ambulance services,
pregnancy care, notifications, and administration.

The system will be developed using:

- Frontend: React + Vite
- Backend: Node.js + Express.js
- Database: MongoDB
- Real-time communication: Socket.IO
- Authentication: JWT

---

## 2. Main User Roles

MeroAsha will initially support:

1. Patient
2. Doctor
3. Nurse
4. Reception Staff
5. Laboratory Staff
6. Pharmacist
7. Administrator

---

## 3. Main Modules

### Patient
- Registration
- Login
- Profile
- Appointments
- Medical records
- Prescriptions
- Laboratory reports
- Blood requests
- Ambulance requests
- Pregnancy care
- Notifications

### Doctor
- Login
- Doctor profile
- Patient list
- Appointment queue
- Patient consultation
- Diagnosis
- Prescription
- Medical records
- Laboratory requests

### Staff
- Patient management
- Appointment management
- Queue management
- Blood bank
- Ambulance
- Laboratory
- Pharmacy

### Administrator
- User management
- Staff management
- Doctor management
- Department management
- System configuration
- Reports
- Audit logs

---

## 4. Development Principle

MeroAsha will be developed phase by phase.

Each module must be:

1. Designed
2. Implemented
3. Connected to the database
4. Tested
5. Reviewed
6. Improved according to real hospital requirements

The system should remain modular so that requirements can be changed
without rebuilding the entire application.

---

## 5. Development Phases

### Phase 0
Requirements and Planning

### Phase 1
Core Architecture

### Phase 2
Authentication and Security

### Phase 3
User Management

### Phase 4
Patient Management

### Phase 5
Doctors and Departments

### Phase 6
Appointments and Queue

### Phase 7
Doctor Consultation

### Phase 8
Medical Records

### Phase 9
Laboratory

### Phase 10
Pharmacy

### Phase 11
Blood Bank

### Phase 12
Ambulance and Emergency

### Phase 13
Pregnancy Care

### Phase 14
Real-Time Notifications

### Phase 15
Admin Dashboard

### Phase 16
Security and Audit

### Phase 17
Testing

### Phase 18
Deployment

### Phase 19
Hospital Pilot

### Phase 20
Production

---

## 6. Important Requirement

The system will initially be developed as a controlled prototype.

Before real hospital deployment, requirements for security,
privacy, medical records, auditability, backups, access control,
and applicable healthcare regulations must be reviewed.

---

## 7. User Workflow

### 7.1 Patient Workflow

Patient
↓
Register
↓
Login
↓
Patient Dashboard
↓
Complete Profile
↓
Search Department
↓
Select Doctor
↓
Check Available Appointment
↓
Book Appointment
↓
Receive Confirmation
↓
Visit Hospital
↓
Doctor Consultation
↓
Prescription / Laboratory Test
↓
Medical Record Updated
↓
View Reports / Prescription
↓
Follow-up Appointment

### 7.2 Doctor Workflow

Doctor
↓
Login
↓
Doctor Dashboard
↓
View Today's Appointments
↓
View Patient Queue
↓
Open Patient Record
↓
Consult Patient
↓
Enter Symptoms
↓
Enter Diagnosis
↓
Create Prescription
↓
Request Laboratory Test if Required
↓
Save Consultation
↓
Medical Record Updated

### 7.3 Reception Workflow

Reception Staff
↓
Login
↓
Staff Dashboard
↓
Register Patient
↓
Search Patient
↓
Create / Manage Appointment
↓
Manage Patient Queue
↓
Check Appointment Status
↓
Update Patient Visit Status

### 7.4 Laboratory Workflow

Laboratory Staff
↓
Login
↓
Laboratory Dashboard
↓
View Test Requests
↓
Select Patient
↓
Collect / Receive Sample
↓
Process Test
↓
Enter Result
↓
Verify Result
↓
Publish Report
↓
Patient / Doctor Can View Report

### 7.5 Pharmacy Workflow

Pharmacist
↓
Login
↓
Pharmacy Dashboard
↓
Receive Prescription
↓
View Prescribed Medicines
↓
Check Medicine Availability
↓
Dispense Medicine
↓
Update Stock
↓
Record Pharmacy Transaction

### 7.6 Blood Bank Workflow

Blood Bank Staff
↓
Login
↓
Blood Bank Dashboard
↓
View Blood Inventory
↓
Receive Blood Donation
↓
Update Blood Stock
↓
Receive Blood Request
↓
Verify Availability
↓
Approve / Reject Request
↓
Issue Blood
↓
Update Inventory

### 7.7 Ambulance Workflow

Patient / Staff
↓
Emergency Request
↓
Enter Emergency Information
↓
Request Ambulance
↓
Emergency Staff Receives Request
↓
Check Ambulance Availability
↓
Assign Ambulance
↓
Assign Driver / Team
↓
Ambulance Dispatched
↓
Patient Picked Up
↓
Hospital Arrival
↓
Emergency Case Registered

### 7.8 Administrator Workflow

Administrator
↓
Login
↓
Admin Dashboard
↓
Manage Users
↓
Manage Doctors
↓
Manage Staff
↓
Manage Departments
↓
Manage Hospital Services
↓
View Reports
↓
View Audit Logs
↓
System Configuration

---

## 8. MeroAsha Modules

### 8.1 Authentication
- Patient registration
- Patient login
- Staff login
- Doctor login
- Admin login
- Logout
- Password management
- Role-based access

### 8.2 User Management
- User profile
- User status
- User role
- Contact information
- Account management

### 8.3 Patient Management
- Patient registration
- Patient profile
- Patient ID
- Patient medical history
- Patient appointments
- Patient medical records

### 8.4 Doctor Management
- Doctor profile
- Doctor ID
- Specialization
- Department
- Availability
- Consultation schedule

### 8.5 Department Management
- Department creation
- Department information
- Doctors assigned to department
- Department availability

### 8.6 Appointment Management
- Book appointment
- Available slots
- Appointment confirmation
- Reschedule appointment
- Cancel appointment
- Appointment history
- Appointment status

### 8.7 Queue Management
- Generate token
- Patient queue
- Current token
- Doctor queue
- Queue status
- Completed consultation

### 8.8 Doctor Consultation
- Patient symptoms
- Diagnosis
- Clinical notes
- Prescription
- Laboratory request
- Follow-up recommendation

### 8.9 Medical Records
- Patient medical history
- Consultation records
- Diagnosis
- Prescriptions
- Laboratory reports
- Uploaded documents

### 8.10 Laboratory
- Laboratory test catalog
- Test request
- Sample collection
- Test processing
- Test result
- Laboratory report
- Report verification

### 8.11 Pharmacy
- Medicine catalog
- Medicine stock
- Prescription processing
- Medicine dispensing
- Stock management
- Pharmacy transactions

### 8.12 Blood Bank
- Blood groups
- Blood inventory
- Blood donation
- Blood request
- Blood issue
- Blood stock management

### 8.13 Ambulance and Emergency
- Emergency request
- Ambulance availability
- Ambulance assignment
- Driver information
- Emergency status
- Hospital arrival

### 8.14 Pregnancy Care
- Pregnancy registration
- Pregnancy profile
- Checkup schedule
- Pregnancy appointments
- Reports
- Follow-up reminders

### 8.15 Notifications
- Appointment notifications
- Laboratory report notifications
- Prescription notifications
- Emergency notifications
- System notifications

### 8.16 Administration
- User management
- Staff management
- Doctor management
- Department management
- Reports
- System settings
- Audit logs

---

## 9. Core Database Entities

The initial MeroAsha database will be designed around the following
entities:

### Identity and Access
- User
- Role
- Permission

### Hospital
- Department
- Doctor
- Staff

### Patient
- Patient
- MedicalRecord
- Consultation
- Prescription

### Appointment
- Appointment
- Queue

### Laboratory
- LabTest
- LabRequest
- LabReport

### Pharmacy
- Medicine
- MedicineStock
- PharmacyTransaction

### Blood Bank
- BloodInventory
- BloodDonation
- BloodRequest
- BloodIssue

### Emergency
- Ambulance
- AmbulanceDriver
- EmergencyRequest

### Pregnancy Care
- PregnancyProfile
- PregnancyVisit

### Communication
- Notification

### Security
- AuditLog

---

## 10. Roles and Permissions

MeroAsha will use role-based access control (RBAC).

Each user will have a defined role, and each role will have access only
to the functions required for that role.

### 10.1 Patient

Patient can:

- Register account
- Login
- Manage own profile
- View own appointments
- Book appointments
- Cancel appointments
- View own medical records
- View own prescriptions
- View own laboratory reports
- Request ambulance
- Submit blood request
- Access pregnancy care information when applicable
- Receive notifications

Patient cannot:

- Access another patient's records
- Modify doctor records
- Modify laboratory results
- Modify blood inventory
- Manage users
- Access administration functions

---

### 10.2 Doctor

Doctor can:

- Login
- Manage own profile
- View assigned appointments
- View assigned patient information
- View relevant patient medical history
- Conduct consultation
- Enter diagnosis
- Add clinical notes
- Create prescriptions
- Request laboratory tests
- View laboratory reports
- Recommend follow-up
- Receive notifications

Doctor cannot:

- Modify another doctor's profile
- Manage system users
- Modify laboratory results
- Modify blood inventory
- Access system administration functions unless explicitly authorized

---

### 10.3 Nurse

Nurse can:

- Login
- View assigned patients
- View relevant patient information
- View appointments
- Assist with patient queue
- Record permitted nursing information
- View relevant medical records
- Receive notifications

Nurse cannot:

- Change doctor records without authorization
- Modify laboratory results
- Manage system users
- Access administration functions

---

### 10.4 Reception Staff

Reception staff can:

- Login
- Register patients
- Search patients
- Manage appointments
- Manage appointment queue
- Generate patient tokens
- Update appointment status
- View basic patient information
- Receive notifications

Reception staff cannot:

- Modify medical diagnosis
- Create prescriptions
- Modify laboratory results
- Modify blood inventory unless specifically authorized

---

### 10.5 Laboratory Staff

Laboratory staff can:

- Login
- View laboratory requests
- View required patient information
- Manage sample status
- Enter laboratory results
- Verify laboratory reports
- Publish laboratory reports
- View laboratory history

Laboratory staff cannot:

- Modify doctor consultation records
- Create prescriptions
- Manage system users

---

### 10.6 Pharmacist

Pharmacist can:

- Login
- View prescriptions
- Process prescriptions
- Dispense medicines
- Manage medicine inventory
- Update medicine stock
- Record pharmacy transactions

Pharmacist cannot:

- Modify doctor diagnosis
- Modify laboratory reports
- Access patient records beyond required pharmacy information
- Manage system users

---

### 10.7 Blood Bank Staff

Blood bank staff can:

- Login
- Manage blood inventory
- Record blood donations
- Process blood requests
- Record blood issues
- Update blood stock
- View blood bank reports

Blood bank staff cannot:

- Modify patient medical records
- Modify doctor consultation records
- Manage system users unless authorized

---

### 10.8 Ambulance / Emergency Staff

Emergency staff can:

- Login
- Receive emergency requests
- View emergency information
- Check ambulance availability
- Assign ambulances
- Assign drivers
- Update emergency status
- Record hospital arrival

Emergency staff cannot:

- Modify unrelated medical records
- Manage system users unless authorized

---

### 10.9 Administrator

Administrator can:

- Manage users
- Manage roles
- Manage permissions
- Manage doctors
- Manage staff
- Manage departments
- Manage hospital services
- View system reports
- Configure system settings
- View audit logs
- Manage system-wide configuration

Administrator access must be protected with strong authentication
and additional security controls.

---

## 11. Access Control Principle

MeroAsha will follow the principle of least privilege.

A user should receive only the permissions required to perform their
assigned responsibilities.

Access to sensitive patient information must be controlled based on:

- User role
- User permissions
- Patient relationship
- Hospital department
- Assigned responsibilities
- Authentication status

All sensitive administrative and medical operations should be
auditable.