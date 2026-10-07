const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../src/models/User");
const Doctor = require("../src/models/Doctor");
const Department = require("../src/models/Department");

const departments = [
  {
    name: "General Medicine",
    code: "GMED",
    description: "Diagnosis and management of common and complex adult medical conditions.",
    location: "Main Hospital Block",
    floor: 1,
    contactNumber: "080-40001001",
  },
  {
    name: "Cardiology",
    code: "CARD",
    description: "Diagnosis and treatment of cardiovascular diseases.",
    location: "Cardiac Sciences Block",
    floor: 2,
    contactNumber: "080-40001002",
  },
  {
    name: "Pediatrics",
    code: "PED",
    description: "Medical care for infants, children and adolescents.",
    location: "Mother & Child Block",
    floor: 2,
    contactNumber: "080-40001003",
  },
  {
    name: "Neurology",
    code: "NEUR",
    description: "Diagnosis and treatment of disorders of the brain, spinal cord and nerves.",
    location: "Neurosciences Block",
    floor: 3,
    contactNumber: "080-40001004",
  },
  {
    name: "Neurosurgery",
    code: "NSUR",
    description: "Surgical treatment of disorders affecting the brain and nervous system.",
    location: "Neurosciences Block",
    floor: 3,
    contactNumber: "080-40001005",
  },
  {
    name: "Orthopaedics",
    code: "ORTH",
    description: "Treatment of bone, joint, muscle and spine conditions.",
    location: "Orthopaedic Block",
    floor: 2,
    contactNumber: "080-40001006",
  },
  {
    name: "Obstetrics & Gynaecology",
    code: "OGYN",
    description: "Women's health, pregnancy, childbirth and reproductive healthcare.",
    location: "Mother & Child Block",
    floor: 2,
    contactNumber: "080-40001007",
  },
  {
    name: "Gastroenterology",
    code: "GAST",
    description: "Diagnosis and treatment of digestive system and liver disorders.",
    location: "Speciality Block",
    floor: 3,
    contactNumber: "080-40001008",
  },
  {
    name: "Nephrology",
    code: "NEPH",
    description: "Medical care for kidney diseases and renal disorders.",
    location: "Renal Sciences Block",
    floor: 3,
    contactNumber: "080-40001009",
  },
  {
    name: "Urology",
    code: "UROL",
    description: "Diagnosis and treatment of urinary tract and male reproductive conditions.",
    location: "Renal Sciences Block",
    floor: 3,
    contactNumber: "080-40001010",
  },
  {
    name: "Dermatology",
    code: "DERM",
    description: "Diagnosis and treatment of skin, hair and nail disorders.",
    location: "Speciality Block",
    floor: 1,
    contactNumber: "080-40001011",
  },
  {
    name: "ENT",
    code: "ENT",
    description: "Treatment of ear, nose, throat and related head and neck conditions.",
    location: "Speciality Block",
    floor: 1,
    contactNumber: "080-40001012",
  },
  {
    name: "Ophthalmology",
    code: "OPHT",
    description: "Comprehensive medical and surgical eye care.",
    location: "Speciality Block",
    floor: 1,
    contactNumber: "080-40001013",
  },
  {
    name: "Pulmonology",
    code: "PULM",
    description: "Diagnosis and treatment of respiratory and lung diseases.",
    location: "Speciality Block",
    floor: 3,
    contactNumber: "080-40001014",
  },
  {
    name: "Endocrinology",
    code: "ENDO",
    description: "Treatment of diabetes, thyroid and other hormonal disorders.",
    location: "Speciality Block",
    floor: 2,
    contactNumber: "080-40001015",
  },
  {
    name: "General Surgery",
    code: "GSUR",
    description: "General and minimally invasive surgical services.",
    location: "Surgical Block",
    floor: 2,
    contactNumber: "080-40001016",
  },
  {
    name: "Psychiatry",
    code: "PSYC",
    description: "Mental health assessment, diagnosis and treatment.",
    location: "Speciality Block",
    floor: 1,
    contactNumber: "080-40001017",
  },
  {
    name: "Oncology",
    code: "ONCO",
    description: "Medical evaluation and treatment of cancer and related conditions.",
    location: "Oncology Block",
    floor: 4,
    contactNumber: "080-40001018",
  },
  {
    name: "Radiology",
    code: "RADI",
    description: "Diagnostic imaging and image-guided medical services.",
    location: "Diagnostics Block",
    floor: 1,
    contactNumber: "080-40001019",
  },
  {
    name: "Emergency Medicine",
    code: "EMER",
    description: "24-hour emergency assessment, stabilization and acute care.",
    location: "Emergency Block",
    floor: 1,
    contactNumber: "080-40001020",
  },
  {
    name: "Anaesthesiology",
    code: "ANES",
    description: "Anaesthesia, perioperative medicine and pain management.",
    location: "Surgical Block",
    floor: 2,
    contactNumber: "080-40001021",
  },
  {
    name: "Rheumatology",
    code: "RHEU",
    description: "Diagnosis and treatment of autoimmune and musculoskeletal diseases.",
    location: "Speciality Block",
    floor: 2,
    contactNumber: "080-40001022",
  },
];

const doctors = [
  {
    name: "Dr. Arjun Mehta",
    email: "arjun.mehta@meroasha.com",
    doctorId: "DOC-1001",
    departmentCode: "GMED",
    specialization: "Internal Medicine",
    qualification: "MBBS, MD General Medicine",
    experienceYears: 12,
    consultationFee: 600,
    licenseNumber: "MAH-10001",
    bio: "Experienced physician specializing in adult medicine and chronic disease management.",
  },
  {
    name: "Dr. Rohan Iyer",
    email: "rohan.iyer@meroasha.com",
    doctorId: "DOC-1002",
    departmentCode: "CARD",
    specialization: "Interventional Cardiology",
    qualification: "MBBS, MD, DM Cardiology",
    experienceYears: 15,
    consultationFee: 1000,
    licenseNumber: "MAH-10002",
    bio: "Cardiologist specializing in interventional cardiovascular procedures and heart disease management.",
  },
  {
    name: "Dr. Neha Kulkarni",
    email: "neha.kulkarni@meroasha.com",
    doctorId: "DOC-1003",
    departmentCode: "CARD",
    specialization: "Clinical Cardiology",
    qualification: "MBBS, MD, DNB Cardiology",
    experienceYears: 10,
    consultationFee: 900,
    licenseNumber: "MAH-10003",
    bio: "Clinical cardiologist focused on preventive and comprehensive cardiovascular care.",
  },
  {
    name: "Dr. Kavya Nair",
    email: "kavya.nair@meroasha.com",
    doctorId: "DOC-1004",
    departmentCode: "PED",
    specialization: "Pediatrician",
    qualification: "MBBS, MD Pediatrics",
    experienceYears: 9,
    consultationFee: 700,
    licenseNumber: "MAH-10004",
    bio: "Pediatrician providing comprehensive healthcare for children and adolescents.",
  },
  {
    name: "Dr. Aditya Rao",
    email: "aditya.rao@meroasha.com",
    doctorId: "DOC-1005",
    departmentCode: "NEUR",
    specialization: "Neurologist",
    qualification: "MBBS, MD, DM Neurology",
    experienceYears: 14,
    consultationFee: 1000,
    licenseNumber: "MAH-10005",
    bio: "Neurologist specializing in stroke, epilepsy and neurological disorders.",
  },
  {
    name: "Dr. Sameer Joshi",
    email: "sameer.joshi@meroasha.com",
    doctorId: "DOC-1006",
    departmentCode: "NSUR",
    specialization: "Neurosurgeon",
    qualification: "MBBS, MS, MCh Neurosurgery",
    experienceYears: 17,
    consultationFee: 1200,
    licenseNumber: "MAH-10006",
    bio: "Neurosurgeon specializing in complex brain and spine procedures.",
  },
  {
    name: "Dr. Priya Menon",
    email: "priya.menon@meroasha.com",
    doctorId: "DOC-1007",
    departmentCode: "ORTH",
    specialization: "Joint Replacement",
    qualification: "MBBS, MS Orthopaedics",
    experienceYears: 13,
    consultationFee: 900,
    licenseNumber: "MAH-10007",
    bio: "Orthopaedic surgeon specializing in joint replacement and degenerative joint conditions.",
  },
  {
    name: "Dr. Vivek Bhat",
    email: "vivek.bhat@meroasha.com",
    doctorId: "DOC-1008",
    departmentCode: "ORTH",
    specialization: "Spine & Sports Medicine",
    qualification: "MBBS, MS Orthopaedics, Fellowship Sports Medicine",
    experienceYears: 11,
    consultationFee: 850,
    licenseNumber: "MAH-10008",
    bio: "Orthopaedic specialist focused on spine disorders and sports-related injuries.",
  },
  {
    name: "Dr. Ananya Sharma",
    email: "ananya.sharma@meroasha.com",
    doctorId: "DOC-1009",
    departmentCode: "OGYN",
    specialization: "Obstetrician & Gynaecologist",
    qualification: "MBBS, MD Obstetrics & Gynaecology",
    experienceYears: 12,
    consultationFee: 800,
    licenseNumber: "MAH-10009",
    bio: "Obstetrician and gynaecologist providing pregnancy and women's healthcare services.",
  },
  {
    name: "Dr. Meera Krishnan",
    email: "meera.krishnan@meroasha.com",
    doctorId: "DOC-1010",
    departmentCode: "OGYN",
    specialization: "Maternal & Fetal Medicine",
    qualification: "MBBS, MD, Fellowship Maternal Medicine",
    experienceYears: 15,
    consultationFee: 1000,
    licenseNumber: "MAH-10010",
    bio: "Specialist in high-risk pregnancy and maternal-fetal healthcare.",
  },
  {
    name: "Dr. Karan Malhotra",
    email: "karan.malhotra@meroasha.com",
    doctorId: "DOC-1011",
    departmentCode: "GAST",
    specialization: "Medical Gastroenterologist",
    qualification: "MBBS, MD, DM Gastroenterology",
    experienceYears: 14,
    consultationFee: 1000,
    licenseNumber: "MAH-10011",
    bio: "Gastroenterologist specializing in digestive, liver and gastrointestinal disorders.",
  },
  {
    name: "Dr. Sneha Reddy",
    email: "sneha.reddy@meroasha.com",
    doctorId: "DOC-1012",
    departmentCode: "NEPH",
    specialization: "Nephrologist",
    qualification: "MBBS, MD, DM Nephrology",
    experienceYears: 13,
    consultationFee: 950,
    licenseNumber: "MAH-10012",
    bio: "Nephrologist specializing in chronic kidney disease and renal care.",
  },
  {
    name: "Dr. Rahul Deshpande",
    email: "rahul.deshpande@meroasha.com",
    doctorId: "DOC-1013",
    departmentCode: "UROL",
    specialization: "Urologist",
    qualification: "MBBS, MS, MCh Urology",
    experienceYears: 12,
    consultationFee: 900,
    licenseNumber: "MAH-10013",
    bio: "Urologist specializing in urinary tract disorders and minimally invasive procedures.",
  },
  {
    name: "Dr. Ishita Kapoor",
    email: "ishita.kapoor@meroasha.com",
    doctorId: "DOC-1014",
    departmentCode: "DERM",
    specialization: "Dermatologist",
    qualification: "MBBS, MD Dermatology",
    experienceYears: 8,
    consultationFee: 650,
    licenseNumber: "MAH-10014",
    bio: "Dermatologist specializing in medical and cosmetic skin conditions.",
  },
  {
    name: "Dr. Nikhil Verma",
    email: "nikhil.verma@meroasha.com",
    doctorId: "DOC-1015",
    departmentCode: "ENT",
    specialization: "ENT Specialist",
    qualification: "MBBS, MS ENT",
    experienceYears: 10,
    consultationFee: 700,
    licenseNumber: "MAH-10015",
    bio: "ENT specialist providing comprehensive ear, nose and throat care.",
  },
  {
    name: "Dr. Pooja Shah",
    email: "pooja.shah@meroasha.com",
    doctorId: "DOC-1016",
    departmentCode: "OPHT",
    specialization: "Ophthalmologist",
    qualification: "MBBS, MS Ophthalmology",
    experienceYears: 9,
    consultationFee: 700,
    licenseNumber: "MAH-10016",
    bio: "Ophthalmologist providing comprehensive eye examinations and treatment.",
  },
  {
    name: "Dr. Abhishek Singh",
    email: "abhishek.singh@meroasha.com",
    doctorId: "DOC-1017",
    departmentCode: "PULM",
    specialization: "Pulmonologist",
    qualification: "MBBS, MD Pulmonary Medicine",
    experienceYears: 11,
    consultationFee: 800,
    licenseNumber: "MAH-10017",
    bio: "Pulmonologist specializing in asthma, COPD and respiratory disorders.",
  },
  {
    name: "Dr. Tanya Bose",
    email: "tanya.bose@meroasha.com",
    doctorId: "DOC-1018",
    departmentCode: "ENDO",
    specialization: "Diabetologist & Endocrinologist",
    qualification: "MBBS, MD, DM Endocrinology",
    experienceYears: 13,
    consultationFee: 850,
    licenseNumber: "MAH-10018",
    bio: "Endocrinologist specializing in diabetes, thyroid and metabolic disorders.",
  },
  {
    name: "Dr. Rajiv Menon",
    email: "rajiv.menon@meroasha.com",
    doctorId: "DOC-1019",
    departmentCode: "GSUR",
    specialization: "General & Laparoscopic Surgeon",
    qualification: "MBBS, MS General Surgery",
    experienceYears: 16,
    consultationFee: 850,
    licenseNumber: "MAH-10019",
    bio: "General surgeon with expertise in laparoscopic and minimally invasive procedures.",
  },
  {
    name: "Dr. Shreya Patel",
    email: "shreya.patel@meroasha.com",
    doctorId: "DOC-1020",
    departmentCode: "PSYC",
    specialization: "Psychiatrist",
    qualification: "MBBS, MD Psychiatry",
    experienceYears: 8,
    consultationFee: 700,
    licenseNumber: "MAH-10020",
    bio: "Psychiatrist providing assessment and treatment for a range of mental health conditions.",
  },
  {
    name: "Dr. Manish Agarwal",
    email: "manish.agarwal@meroasha.com",
    doctorId: "DOC-1021",
    departmentCode: "ONCO",
    specialization: "Medical Oncologist",
    qualification: "MBBS, MD, DM Medical Oncology",
    experienceYears: 15,
    consultationFee: 1200,
    licenseNumber: "MAH-10021",
    bio: "Medical oncologist specializing in multidisciplinary cancer care.",
  },
  {
    name: "Dr. Divya Thomas",
    email: "divya.thomas@meroasha.com",
    doctorId: "DOC-1022",
    departmentCode: "RADI",
    specialization: "Diagnostic Radiologist",
    qualification: "MBBS, MD Radiology",
    experienceYears: 10,
    consultationFee: 750,
    licenseNumber: "MAH-10022",
    bio: "Radiologist specializing in diagnostic imaging and image interpretation.",
  },
  {
    name: "Dr. Akash Kumar",
    email: "akash.kumar@meroasha.com",
    doctorId: "DOC-1023",
    departmentCode: "EMER",
    specialization: "Emergency Physician",
    qualification: "MBBS, MD Emergency Medicine",
    experienceYears: 9,
    consultationFee: 700,
    licenseNumber: "MAH-10023",
    bio: "Emergency physician specializing in acute and critical patient stabilization.",
  },
  {
    name: "Dr. Farhan Ali",
    email: "farhan.ali@meroasha.com",
    doctorId: "DOC-1024",
    departmentCode: "ANES",
    specialization: "Anaesthesiologist",
    qualification: "MBBS, MD Anaesthesiology",
    experienceYears: 12,
    consultationFee: 800,
    licenseNumber: "MAH-10024",
    bio: "Anaesthesiologist specializing in perioperative care and pain management.",
  },
  {
    name: "Dr. Ritu Sinha",
    email: "ritu.sinha@meroasha.com",
    doctorId: "DOC-1025",
    departmentCode: "RHEU",
    specialization: "Rheumatologist",
    qualification: "MBBS, MD, DM Rheumatology",
    experienceYears: 10,
    consultationFee: 850,
    licenseNumber: "MAH-10025",
    bio: "Rheumatologist specializing in autoimmune and inflammatory musculoskeletal disorders.",
  },
];

const seedDoctors = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully.");

    /*
     * ---------------------------------------------------------
     * 1. CREATE / FIND DEPARTMENTS
     * ---------------------------------------------------------
     */

    const departmentMap = {};

    for (const departmentData of departments) {
      const department = await Department.findOneAndUpdate(
        { code: departmentData.code },
        {
          $set: {
            name: departmentData.name,
            description: departmentData.description,
            location: departmentData.location,
            floor: departmentData.floor,
            contactNumber: departmentData.contactNumber,
            active: true,
          },
          $setOnInsert: {
            code: departmentData.code,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      departmentMap[department.code] = department;

      console.log(
        `Department ready: ${department.name} (${department.code})`
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. CREATE USERS + DOCTOR PROFILES
     * ---------------------------------------------------------
     */

    const defaultPassword = "Doctor@12345";

    for (const doctorData of doctors) {
      const department = departmentMap[doctorData.departmentCode];

      if (!department) {
        console.log(
          `Skipping ${doctorData.name}: department not found`
        );

        continue;
      }

      const passwordHash = await bcrypt.hash(
        defaultPassword,
        12
      );

      /*
       * Create doctor login account
       */

      const user = await User.findOneAndUpdate(
        {
          email: doctorData.email,
        },
        {
          $set: {
            name: doctorData.name,
            role: "DOCTOR",
            active: true,
          },
          $setOnInsert: {
            email: doctorData.email,
            passwordHash,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      /*
       * If existing user doesn't have passwordHash,
       * update it.
       */

      if (!user.passwordHash) {
        user.passwordHash = passwordHash;
        await user.save();
      }

      /*
       * Create / update doctor profile
       */

      const doctor = await Doctor.findOneAndUpdate(
        {
          userId: user._id,
        },
        {
          $set: {
            doctorId: doctorData.doctorId,
            departmentId: department._id,
            specialization: doctorData.specialization,
            qualification: doctorData.qualification,
            experienceYears: doctorData.experienceYears,
            consultationFee: doctorData.consultationFee,
            licenseNumber: doctorData.licenseNumber,
            bio: doctorData.bio,
            availableForConsultation: true,
            active: true,
          },
          $setOnInsert: {
            userId: user._id,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(
        `Doctor ready: ${doctorData.name} → ${department.name}`
      );
    }

    console.log("\n======================================");
    console.log("MeroAsha Doctor Seed Completed");
    console.log("======================================");

    console.log(`Departments: ${departments.length}`);
    console.log(`Doctors: ${doctors.length}`);

    console.log("\nDefault doctor login:");
    console.log("Email: doctor-email@meroasha.com");
    console.log("Password: Doctor@12345");

    console.log(
      "\nEach seeded doctor uses password: Doctor@12345"
    );

    await mongoose.disconnect();

    console.log("\nMongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Doctor seed failed:");
    console.error(error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedDoctors();