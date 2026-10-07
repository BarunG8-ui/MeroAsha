# MeroAsha System Architecture

## 1. Architecture Overview

MeroAsha will use a three-layer web application architecture.

```text
┌──────────────────────────────┐
│        MeroAsha Frontend     │
│                              │
│       React + Vite           │
│                              │
│  Patient | Doctor | Staff    │
│           | Admin            │
└──────────────┬───────────────┘
               │
               │ HTTP / REST API
               │
               ▼
┌──────────────────────────────┐
│        MeroAsha Backend      │
│                              │
│      Node.js + Express       │
│                              │
│ Routes                       │
│ Controllers                  │
│ Middleware                   │
│ Services                     │
│ Validation                   │
└──────────────┬───────────────┘
               │
               │ Mongoose
               │
               ▼
┌──────────────────────────────┐
│          MongoDB             │
│                              │
│ Users                        │
│ Patients                     │
│ Doctors                      │
│ Appointments                 │
│ Medical Records              │
│ Laboratory                   │
│ Pharmacy                     │
│ Blood Bank                   │
│ Ambulance                    │
│ Notifications                │
│ Audit Logs                   │
└──────────────────────────────┘