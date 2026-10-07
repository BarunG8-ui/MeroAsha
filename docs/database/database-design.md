# MeroAsha MongoDB Database Design

## 1. Database

Database name:

meroasha

Database technology:

MongoDB

ODM:

Mongoose

---

# 2. Database Design Principle

MeroAsha will use MongoDB documents to store hospital information.

The database will be designed around the actual hospital workflow.

Sensitive information should only be accessible to authorized users.

Collections should be kept modular so that the system can be expanded
as hospital requirements evolve.

---

# 3. User Collection

Collection:

users

Purpose:

Stores authentication and basic identity information for all users.

Example fields:

- _id
- name
- email
- phone
- passwordHash
- role
- active
- createdAt
- updatedAt
- lastLoginAt

Example roles:

- PATIENT
- DOCTOR
- NURSE
- RECEPTION
- LAB_STAFF
- PHARMACIST
- BLOOD_BANK_STAFF
- EMERGENCY_STAFF
- ADMIN

---

# 4. Patient Collection

Collection:

patients

Purpose:

Stores patient-specific information.

Example fields:

- _id
- userId
- patientId
- dateOfBirth
- gender
- bloodGroup
- address
- emergencyContact
- allergies
- createdAt
- updatedAt

Relationship:

User
↓
Patient

A patient record is associated with a User account.

---

# 5. Doctor Collection

Collection:

doctors

Purpose:

Stores doctor information.

Example fields:

- _id
- userId
- doctorId
- departmentId
- specialization
- qualification
- experience
- consultationFee
- availability
- licenseNumber
- active
- createdAt
- updatedAt

Relationship:

User
↓
Doctor
↓
Department

---

# 6. Staff Collection

Collection:

staff

Purpose:

Stores hospital staff information.

Example fields:

- _id
- userId
- staffId
- departmentId
- designation
- employeeId
- joiningDate
- active
- createdAt
- updatedAt

---

# 7. Department Collection

Collection:

departments

Purpose:

Stores hospital departments.

Example fields:

- _id
- name
- code
- description
- location
- contactNumber
- active
- createdAt
- updatedAt

Examples:

- General Medicine
- Cardiology
- Pediatrics
- Orthopedics
- Gynecology
- Emergency
- Laboratory
- Pharmacy

---

# 8. Appointment Collection

Collection:

appointments

Purpose:

Stores patient appointments.

Example fields:

- _id
- appointmentId
- patientId
- doctorId
- departmentId
- appointmentDate
- appointmentTime
- tokenNumber
- type
- status
- reason
- notes
- createdAt
- updatedAt

Possible appointment types:

- ONLINE
- WALK_IN
- FOLLOW_UP
- EMERGENCY

Possible statuses:

- BOOKED
- CONFIRMED
- CHECKED_IN
- IN_QUEUE
- IN_CONSULTATION
- COMPLETED
- CANCELLED
- NO_SHOW

---

# 9. Queue Collection

Collection:

queues

Purpose:

Manages daily hospital consultation queues.

Example fields:

- _id
- appointmentId
- patientId
- doctorId
- departmentId
- tokenNumber
- queueDate
- status
- joinedAt
- calledAt
- completedAt

Possible statuses:

- WAITING
- CALLED
- IN_CONSULTATION
- COMPLETED
- SKIPPED

---

# 10. Consultation Collection

Collection:

consultations

Purpose:

Stores information entered by a doctor during patient consultation.

Example fields:

- _id
- patientId
- doctorId
- appointmentId
- symptoms
- clinicalNotes
- diagnosis
- treatmentPlan
- followUpDate
- createdAt
- updatedAt

---

# 11. Medical Record Collection

Collection:

medicalRecords

Purpose:

Stores the patient's longitudinal medical history.

Example fields:

- _id
- patientId
- consultationId
- recordType
- title
- description
- diagnosis
- attachments
- createdBy
- createdAt

Possible record types:

- CONSULTATION
- LAB_REPORT
- PRESCRIPTION
- IMAGING
- PROCEDURE
- OTHER

---

# 12. Prescription Collection

Collection:

prescriptions

Purpose:

Stores medicines prescribed by doctors.

Example fields:

- _id
- patientId
- doctorId
- consultationId
- medicines
- instructions
- validUntil
- status
- createdAt

Medicine item example:

- medicineId
- medicineName
- dosage
- frequency
- duration
- quantity
- instructions

Possible statuses:

- ACTIVE
- DISPENSED
- CANCELLED
- EXPIRED

---

# 13. Laboratory Test Collection

Collection:

labTests

Purpose:

Stores available laboratory tests.

Example fields:

- _id
- name
- code
- category
- description
- price
- sampleType
- preparationInstructions
- active

---

# 14. Laboratory Request Collection

Collection:

labRequests

Purpose:

Stores laboratory tests requested for patients.

Example fields:

- _id
- patientId
- doctorId
- consultationId
- tests
- priority
- status
- requestedAt
- sampleCollectedAt
- completedAt

Possible statuses:

- REQUESTED
- SAMPLE_PENDING
- SAMPLE_COLLECTED
- PROCESSING
- COMPLETED
- CANCELLED

---

# 15. Laboratory Report Collection

Collection:

labReports

Purpose:

Stores laboratory results.

Example fields:

- _id
- labRequestId
- patientId
- testId
- result
- referenceRange
- interpretation
- remarks
- performedBy
- verifiedBy
- status
- createdAt
- verifiedAt

Possible statuses:

- DRAFT
- VERIFIED
- PUBLISHED

---

# 16. Medicine Collection

Collection:

medicines

Purpose:

Stores the hospital medicine catalog.

Example fields:

- _id
- name
- genericName
- brandName
- category
- manufacturer
- strength
- dosageForm
- unitPrice
- prescriptionRequired
- active
- createdAt
- updatedAt

---

# 17. Medicine Stock Collection

Collection:

medicineStocks

Purpose:

Tracks pharmacy inventory.

Example fields:

- _id
- medicineId
- batchNumber
- quantity
- expiryDate
- purchasePrice
- sellingPrice
- supplier
- receivedDate
- createdAt
- updatedAt

---

# 18. Pharmacy Transaction Collection

Collection:

pharmacyTransactions

Purpose:

Records medicine dispensing.

Example fields:

- _id
- patientId
- prescriptionId
- medicines
- totalAmount
- paymentStatus
- dispensedBy
- dispensedAt

---

# 19. Blood Inventory Collection

Collection:

bloodInventory

Purpose:

Stores available blood units.

Example fields:

- _id
- bloodGroup
- component
- unitsAvailable
- collectionDate
- expiryDate
- status
- storageLocation
- updatedAt

Possible components:

- WHOLE_BLOOD
- RBC
- PLASMA
- PLATELETS

---

# 20. Blood Donation Collection

Collection:

bloodDonations

Purpose:

Stores blood donation records.

Example fields:

- _id
- donorId
- bloodGroup
- component
- donationDate
- units
- screeningStatus
- storageStatus
- createdAt

---

# 21. Blood Request Collection

Collection:

bloodRequests

Purpose:

Stores requests for blood.

Example fields:

- _id
- patientId
- requestedBy
- bloodGroup
- component
- unitsRequired
- urgency
- reason
- status
- requestedAt
- approvedAt
- fulfilledAt

Possible statuses:

- REQUESTED
- UNDER_REVIEW
- APPROVED
- REJECTED
- FULFILLED
- CANCELLED

---

# 22. Ambulance Collection

Collection:

ambulances

Purpose:

Stores hospital ambulance information.

Example fields:

- _id
- ambulanceNumber
- registrationNumber
- type
- driverId
- currentLocation
- status
- active
- lastUpdatedAt

Possible statuses:

- AVAILABLE
- ASSIGNED
- ON_TRIP
- MAINTENANCE
- OFFLINE

---

# 23. Emergency Request Collection

Collection:

emergencyRequests

Purpose:

Stores emergency and ambulance requests.

Example fields:

- _id
- requestId
- patientId
- requestedBy
- emergencyType
- location
- contactNumber
- description
- ambulanceId
- priority
- status
- requestedAt
- dispatchedAt
- arrivedAt
- completedAt

Possible priorities:

- CRITICAL
- HIGH
- NORMAL

Possible statuses:

- REQUESTED
- ACCEPTED
- DISPATCHED
- ARRIVED
- COMPLETED
- CANCELLED

---

# 24. Pregnancy Profile Collection

Collection:

pregnancyProfiles

Purpose:

Stores pregnancy care information for patients enrolled in pregnancy care.

Example fields:

- _id
- patientId
- pregnancyStartDate
- expectedDeliveryDate
- pregnancyNumber
- riskLevel
- assignedDoctorId
- status
- createdAt
- updatedAt

---

# 25. Pregnancy Visit Collection

Collection:

pregnancyVisits

Purpose:

Stores pregnancy-related clinical visits.

Example fields:

- _id
- pregnancyProfileId
- patientId
- doctorId
- visitDate
- gestationalAge
- weight
- bloodPressure
- notes
- tests
- recommendations
- nextVisitDate
- createdAt

---

# 26. Notification Collection

Collection:

notifications

Purpose:

Stores system notifications.

Example fields:

- _id
- userId
- type
- title
- message
- relatedEntity
- relatedEntityId
- read
- createdAt

Possible notification types:

- APPOINTMENT
- LAB_REPORT
- PRESCRIPTION
- EMERGENCY
- BLOOD_REQUEST
- SYSTEM

---

# 27. Audit Log Collection

Collection:

auditLogs

Purpose:

Records important system actions.

Example fields:

- _id
- userId
- action
- resource
- resourceId
- description
- ipAddress
- userAgent
- timestamp

Examples of auditable actions:

- Login
- Logout
- Patient record access
- Medical record modification
- Prescription creation
- Laboratory report verification
- User creation
- User deletion
- Permission modification

---

# 28. Main Relationships

The main logical relationships are:

User
│
├── Patient
│
├── Doctor
│
└── Staff

Patient
│
├── Appointments
├── Consultations
├── Medical Records
├── Prescriptions
├── Laboratory Requests
├── Laboratory Reports
├── Blood Requests
├── Emergency Requests
└── Pregnancy Profile

Doctor
│
├── Department
├── Appointments
├── Consultations
├── Prescriptions
└── Laboratory Requests

Appointment
│
├── Patient
├── Doctor
├── Department
└── Queue

Consultation
│
├── Patient
├── Doctor
├── Appointment
└── Prescription

Laboratory Request
│
├── Patient
├── Doctor
├── Consultation
└── Laboratory Report

Prescription
│
├── Patient
├── Doctor
└── Medicines

---

# 29. MongoDB Reference Strategy

MeroAsha will primarily use MongoDB references for entities that have
independent lifecycles.

Example:

```text
Appointment
    patientId → Patient
    doctorId → Doctor
    departmentId → Department


## 8. MongoDB Embedding and Referencing Strategy

MeroAsha will use a hybrid MongoDB data modeling strategy.

### Referenced Data

Independent entities with their own lifecycle will be stored in separate collections and connected using ObjectId references.

Examples:

- User → Patient
- User → Doctor
- User → Staff
- Doctor → Department
- Appointment → Patient
- Appointment → Doctor
- Appointment → Department
- Consultation → Patient
- Consultation → Doctor
- Consultation → Appointment
- Lab Request → Patient
- Lab Request → Doctor
- Prescription → Patient
- Prescription → Doctor
- Medicine Stock → Medicine
- Pregnancy Visit → Pregnancy Profile
- Notification → User

### Embedded Data

Small data that belongs directly to its parent document will be embedded.

Examples:

- Prescription → medicines[]
- Lab Request → tests[]
- Lab Report → results[]
- Consultation → symptoms[]
- Consultation → diagnosis[]

### Design Principles

1. Avoid duplicating complete documents.
2. Use ObjectId references for independently managed entities.
3. Embed small child data that has no independent lifecycle.
4. Preserve historical snapshots where required.
5. Avoid unnecessarily large MongoDB documents.
6. Frequently changing data should not be duplicated across many documents.
7. Authorization must always be enforced by the backend and must not depend only on MongoDB references or populate().
8. Database design should support hospital workflows rather than simply copying relational database tables into MongoDB.

### Initial Decision

MeroAsha will use a hybrid document model rather than attempting to make MongoDB behave exactly like a relational database.


## 9. Complete Database Relationship Map

The following relationship structure defines how the major MeroAsha collections are connected.

### Identity and Staff Structure

USER
 │
 ├── PATIENT
 │
 ├── DOCTOR
 │      │
 │      └── DEPARTMENT
 │
 └── STAFF
        │
        └── DEPARTMENT


### Patient Healthcare Flow

PATIENT
 │
 ├── APPOINTMENT
 │       │
 │       └── QUEUE
 │
 ├── CONSULTATION
 │       │
 │       ├── PRESCRIPTION
 │       │       │
 │       │       └── MEDICINE
 │       │
 │       └── LAB REQUEST
 │               │
 │               ├── LAB TEST
 │               └── LAB REPORT
 │
 ├── MEDICAL RECORD
 │
 ├── BLOOD REQUEST
 │
 ├── EMERGENCY REQUEST
 │       │
 │       └── AMBULANCE
 │
 └── PREGNANCY PROFILE
         │
         └── PREGNANCY VISIT


### Pharmacy Flow

MEDICINE
 │
 └── MEDICINE STOCK
        │
        └── PHARMACY TRANSACTION
                 │
                 ├── PATIENT
                 └── PRESCRIPTION


### Blood Bank Flow

BLOOD DONATION
 │
 └── BLOOD INVENTORY
        │
        └── BLOOD REQUEST
                │
                └── BLOOD ISSUE


### Emergency Flow

PATIENT
 │
 └── EMERGENCY REQUEST
          │
          └── AMBULANCE
                 │
                 └── DRIVER / STAFF


### Notification and Audit Flow

USER
 │
 ├── NOTIFICATION
 │
 └── AUDIT LOG

## 10. Database Validation Checklist

The MeroAsha database design is validated against the major hospital workflows.

### 10.1 Authentication

Required data:

- User identity
- Email/phone
- Password hash
- Role
- Account status
- Login timestamps

Collection:

- users

Status: COMPLETE


### 10.2 Patient Management

Required data:

- Patient identity
- Date of birth
- Gender
- Blood group
- Address
- Emergency contact
- Allergies
- Patient ID

Collections:

- users
- patients

Status: COMPLETE


### 10.3 Doctor Management

Required data:

- Doctor identity
- Department
- Specialization
- Qualification
- Experience
- License number
- Consultation fee
- Availability

Collections:

- users
- doctors
- departments

Status: COMPLETE


### 10.4 Appointment Management

Required data:

- Patient
- Doctor
- Department
- Date
- Time
- Token
- Appointment type
- Status
- Reason

Collection:

- appointments

Status: COMPLETE


### 10.5 Queue Management

Required data:

- Appointment
- Patient
- Doctor
- Token number
- Queue date
- Queue status
- Called time
- Completion time

Collection:

- queues

Status: COMPLETE


### 10.6 Doctor Consultation

Required data:

- Patient
- Doctor
- Appointment
- Symptoms
- Clinical notes
- Diagnosis
- Treatment plan
- Follow-up date

Collection:

- consultations

Status: COMPLETE


### 10.7 Medical Records

Required data:

- Patient
- Record type
- Source entity
- Diagnosis
- Description
- Attachments
- Created by
- Creation date

Collection:

- medicalRecords

Status: COMPLETE


### 10.8 Prescription

Required data:

- Patient
- Doctor
- Consultation
- Medicines
- Dosage
- Frequency
- Duration
- Quantity
- Instructions
- Prescription status

Collection:

- prescriptions

Status: COMPLETE


### 10.9 Laboratory

Required data:

- Available laboratory tests
- Test code
- Category
- Sample type
- Price
- Patient
- Doctor
- Consultation
- Requested tests
- Sample collection
- Results
- Verification
- Report status

Collections:

- labTests
- labRequests
- labReports

Status: COMPLETE


### 10.10 Pharmacy

Required data:

- Medicine
- Generic name
- Brand
- Strength
- Dosage form
- Price
- Prescription requirement
- Batch number
- Stock quantity
- Expiry date
- Supplier
- Pharmacy transaction

Collections:

- medicines
- medicineStocks
- pharmacyTransactions

Status: COMPLETE


### 10.11 Blood Bank

Required data:

- Blood group
- Blood component
- Donation
- Inventory
- Request
- Units
- Urgency
- Approval
- Issue

Collections:

- bloodDonations
- bloodInventory
- bloodRequests
- bloodIssues

Status: COMPLETE


### 10.12 Ambulance and Emergency

Required data:

- Emergency request
- Patient/contact information
- Emergency type
- Location
- Priority
- Ambulance
- Driver/staff
- Dispatch status
- Arrival status
- Completion status

Collections:

- emergencyRequests
- ambulances
- staff

Status: COMPLETE


### 10.13 Pregnancy Care

Required data:

- Patient
- Pregnancy profile
- Pregnancy start date
- Expected delivery date
- Risk level
- Assigned doctor
- Pregnancy visits
- Measurements
- Tests
- Recommendations
- Next visit

Collections:

- pregnancyProfiles
- pregnancyVisits

Status: COMPLETE


### 10.14 Notifications

Required data:

- User
- Notification type
- Title
- Message
- Related entity
- Read status
- Creation date

Collection:

- notifications

Status: COMPLETE


### 10.15 Security and Audit

Required data:

- User
- Action
- Resource
- Resource ID
- Description
- IP address
- User agent
- Timestamp

Collection:

- auditLogs

Status: COMPLETE


## 11. Database Design Decision

The MeroAsha database will use MongoDB with Mongoose.

The design follows these principles:

1. Independent entities use separate collections.
2. ObjectId references connect independent entities.
3. Small child data is embedded where appropriate.
4. Historical information is preserved where required.
5. Large documents are avoided.
6. Frequently changing data is not unnecessarily duplicated.
7. Backend authorization is required for protected operations.
8. Audit information is stored separately.
9. Database indexes will be added for frequently searched fields.
10. Validation rules will be implemented in Mongoose schemas and backend services.

## 12. Database Status

Phase 0 database design is considered finalized for the initial MeroAsha implementation.

The next stage is implementation of the database using Mongoose models.