# Online Hostel Management System
### New Arts, Commerce and Science College, Ahilyanagar (Autonomous)
### नवे कला, वाणिज्य आणि विज्ञान महाविद्यालय, अहिल्यानगर (स्वायत्त)

[![Java](https://img.shields.io/badge/Java-21%2B%20%7C%2022-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, production-grade, full-stack web application designed for collegiate student accommodation management. Built specifically for **New Arts, Commerce and Science College, Ahilyanagar (Autonomous)**, supporting **Bilingual operations (Marathi & English)**, real-time dynamic dashboard metrics (zero hardcoded stats), strict gender-to-hostel verification, bed-level visual allocation, and online mock payment processing with instant receipt generation.

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Architecture & Design](#-architecture--design)
5. [User Roles & Permissions](#-user-roles--permissions)
6. [Hostel Structure & Business Logic](#-hostel-structure--business-logic)
7. [Database Schema & Relationships](#-database-schema--relationships)
8. [REST API Documentation](#-rest-api-documentation)
9. [Pre-configured Demo Accounts](#-pre-configured-demo-accounts)
10. [Prerequisites](#-prerequisites)
11. [Quick Start (One-Click Launch)](#-quick-start-one-click-launch)
12. [Manual Setup & Execution](#-manual-setup--execution)
    - [Database Configuration (MySQL & H2)](#database-configuration)
    - [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
    - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
13. [Environment Variables](#-environment-variables)
14. [Testing & Verification](#-testing--verification)
15. [Deployment Guide](#-deployment-guide)

---

## 🏫 Project Overview

The **Online Hostel Management System** digitizes the entire lifecycle of student hostel allotment for **New Arts, Commerce and Science College, Ahilyanagar**. The system governs two physically and logically segregated hostels:
1. **Boys Hostel (मुलांचे वसतिगृह)** - North Campus
2. **Girls Hostel (मुलींचे वसतिगृह)** - South Campus

The application replaces paper forms and manual records with an automated workflow:
```
Student Registration (Gender Auto-Locked)
       ↓
Submit Application & Upload Documents (Photo, College ID, Aadhaar, Admission Proof)
       ↓
Application Status = PENDING
       ↓
Assigned Hostel Warden Reviews & Verifies Documents
       ↓
Warden Approves (or Rejects with Reason)
       ↓
Warden Allocates Specific Room & Available Bed (Real-time visual bed grid)
       ↓
Student Notified → Online Payment Gateway (UPI / QR / Debit / Credit / NetBanking)
       ↓
Instant Official Payment Receipt with QR Code (Printable / Downloadable)
       ↓
Admission Completed & Bed Marked OCCUPIED
```

---

## 🌟 Key Features

- **🌐 Bilingual Interface (Marathi मराठी & English):** Seamless, instantaneous language switcher across all public, student, warden, and administrator pages.
- **📊 100% Dynamic Statistical Dashboards:** All metrics (Total Rooms, Total Beds, Occupied Beds, Available Beds, Total Students, Pending/Approved/Rejected Applications, Total Revenue) are calculated via dynamic JPQL database queries. **Zero hardcoded numbers.**
- **🔒 Strict Gender-to-Hostel Enforcement:** Male students are permanently locked to Boys Hostel; female students to Girls Hostel. Enforced on both React UI and Spring Boot service layer.
- **🛡️ Data Isolation & Role-Based Access Control:** Boys Hostel Warden can only view, manage, and allocate beds for Boys Hostel; Girls Hostel Warden can only manage Girls Hostel. Super Admin has 360-degree oversight.
- **🛏️ Bed-Level Visual Layout & Constraint Protection:** Visual floor-by-floor room grid with color-coded bed tiles (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`). Database unique constraints and atomic queries guarantee a bed cannot be double-booked.
- **💳 Payment Gateway Simulation & Thermal-Style Receipt:** Comprehensive mock payment gateway supporting UPI (Dynamic QR Code generation), Card, and NetBanking with transaction reference tracking and official university voucher printout.
- **📁 Document Management:** Multi-document upload (Student Photo, College ID, Identity Proof, Admission Receipt) with MIME validation and warden verification status.
- **🔔 Live In-App Notifications:** Real-time bell notifications notifying students of application approvals, room allocations, payment confirmations, and rejections.
- **⚡ Dual Database Support:** Plug-and-play support for **MySQL 8.0+** for production and **H2 In-Memory DB** with auto-seeding for instant zero-config demonstration.

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 18.3.1 (SPA)
- **Build Tool:** Vite 5.4
- **Routing:** React Router v6 (`react-router-dom`)
- **HTTP Client:** Axios (configured with Request/Response JWT interceptors)
- **Icons:** Lucide React (`lucide-react`)
- **Styling:** Modern Vanilla CSS3 Design System (Deep Navy, Slate, Glassmorphism, Responsive CSS Grid & Flexbox)
- **Localization:** React Context API with comprehensive English & Marathi dictionary

### Backend (Dual Implementation Available)
#### 1. Java Spring Boot Backend
- **Platform:** Java 21 / 22
- **Framework:** Spring Boot 3.2.5
- **Security:** Spring Security 6 with Stateless JWT (JSON Web Tokens)
- **ORM / Persistence:** Spring Data JPA / Hibernate 6
- **Database Driver:** MySQL Connector/J & H2 Database
- **Validation:** Jakarta Bean Validation (`spring-boot-starter-validation`)
- **Build Tool:** Apache Maven 3.9+ / Maven Wrapper (`mvnw.cmd`)

#### 2. Node.js Backend (`backend-node/`)
- **Platform:** Node.js (v18+)
- **Framework:** Express.js 4.19
- **Database Client:** `mysql2/promise` with connection pooling
- **Security:** `jsonwebtoken` (JWT) + `bcryptjs`
- **File Uploads:** `multer`
- **CORS & Middleware:** `cors`, `dotenv`

### Database
- **MySQL 8.0+** (Production / Persistent Mode)
- **H2 Database** (Development / Quick Demonstration Profile)

---

## 🏛️ Architecture & Design

The system implements a standard **N-Tier Layered Architecture**:

```
+-------------------------------------------------------------+
|                     Client Browser                         |
|     React.js SPA (Bilingual UI, Auth Context, Axios)       |
+------------------------------+------------------------------+
                               | (REST / JSON + Bearer JWT)
                               v
+-------------------------------------------------------------+
|                  Spring Boot REST APIs                      |
|                                                             |
|  [Security Filter Chain] -> JwtAuthenticationFilter         |
|                               |                             |
|  [Controllers]               -> Auth, Student, Hostel, etc. |
|                               |                             |
|  [Service Layer]             -> Business Logic & Validation |
|                               |                             |
|  [Repositories]              -> Spring Data JPA / JPQL      |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     Database Tier                           |
|             MySQL 8.0  /  H2 In-Memory                      |
+-------------------------------------------------------------+
```

---

## 👥 User Roles & Permissions

| Role | Access Scope | Allowed Operations |
|---|---|---|
| **SUPER ADMIN** | Entire System (Both Hostels) | Full CRUD on Hostels, Wardens, Rooms, Beds, Students; View all Applications & Payments; View Combined & Segregated Analytics. |
| **HOSTEL HEAD (Boys)** | Boys Hostel Only | Review Boys applications, verify documents, approve/reject, allocate Boys rooms/beds, view Boys students and payment ledger. |
| **HOSTEL HEAD (Girls)** | Girls Hostel Only | Review Girls applications, verify documents, approve/reject, allocate Girls rooms/beds, view Girls students and payment ledger. |
| **STUDENT** | Self Profile Only | Register, login, complete application, upload documents, track status timeline, view allocated room/bed, pay hostel fees, download official receipt. |

---

## 🏢 Hostel Structure & Business Logic

```
New Arts, Commerce & Science College, Ahilyanagar
 ├── Boys Hostel (मुलांचे वसतिगृह)
 │    ├── Floor 1
 │    │    ├── Room B-101 (Capacity: 4) ── [Bed B-101-01, Bed B-101-02, Bed B-101-03, Bed B-101-04]
 │    │    ├── Room B-102 (Capacity: 4)
 │    │    └── ... (10 Rooms, 40 Beds)
 │    └── Floor 2 ...
 └── Girls Hostel (मुलींचे वसतिगृह)
      ├── Floor 1
      │    ├── Room G-101 (Capacity: 4) ── [Bed G-101-01, Bed G-101-02, Bed G-101-03, Bed G-101-04]
      │    └── ... (10 Rooms, 40 Beds)
      └── Floor 2 ...
```

### Business Rules Enforced in Backend:
1. **Hostel-Gender Alignment:** Male students can only apply to Boys Hostel; female students to Girls Hostel. Checked in `ApplicationService.java`.
2. **Single Active Application:** A student may have only one active application.
3. **Bed Allocation Pre-condition:** A bed can only be allocated if the student's application status is `APPROVED` and the bed status is `AVAILABLE`.
4. **No Double Booking:** Unique constraint on `allocations(bed_id)` and status check prevents allocating a bed to two students.
5. **Payment Pre-condition:** A student cannot initiate a fee payment unless both application is `APPROVED` and an active room/bed `ALLOCATION` exists.
6. **Dynamic Counter Recalculation:** Available beds are computed as `Total Beds - (Occupied + Reserved + Maintenance)`.

---

## 🗄️ Database Schema & Relationships

The database comprises 11 interconnected relational tables:

```
[app_users]
   │ 1:1
   ├───> [students] ─────1:N─────> [documents]
   │        │ 1:N                     │
   │        ├───> [applications] <────┘
   │        │        │ 1:1
   │        │        └───> [payments]
   │        │ 1:1
   │        └───> [allocations]
   │                 │
[hostels]            │
   │ 1:N             │
   ├───> [hostel_heads]
   ├───> [rooms] ──1:N──> [beds] <─────┘ (allocations.bed_id)
   │
[notifications] (FK user_id)
```

---

## 🔌 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user & return JWT token + user details
- `POST /api/auth/register` - Register a new student account

### Dashboard Metrics (`/api/dashboard`)
- `GET /api/dashboard/admin` - Combined statistics across all hostels (Admin only)
- `GET /api/dashboard/hostel/{hostelId}` - Isolated statistics for a specific hostel (Warden/Admin)

### Hostels (`/api/hostels`)
- `GET /api/hostels` - List all active hostels
- `GET /api/hostels/{id}` - Get hostel details
- `POST /api/hostels` - Create new hostel (Admin)
- `PUT /api/hostels/{id}` - Update hostel (Admin)

### Rooms & Beds (`/api/rooms`, `/api/beds`)
- `GET /api/rooms/hostel/{hostelId}` - List rooms for a specific hostel
- `POST /api/rooms` - Add room (Admin/Warden)
- `GET /api/beds/room/{roomId}` - Get all beds for a room with live status
- `GET /api/beds/available/{hostelId}` - Get all currently available beds in a hostel

### Applications (`/api/applications`)
- `POST /api/applications` - Submit student hostel application
- `GET /api/applications` - List all applications (Admin)
- `GET /api/applications/hostel/{hostelId}` - List applications for hostel (Warden)
- `GET /api/applications/my` - Get logged-in student's application
- `PUT /api/applications/{id}/approve` - Approve application (Warden/Admin)
- `PUT /api/applications/{id}/reject` - Reject application with reason (Warden/Admin)

### Allocations (`/api/allocations`)
- `POST /api/allocations` - Allocate a room and bed to an approved student
- `GET /api/allocations/student/{studentId}` - Get allocation details for a student
- `GET /api/allocations/hostel/{hostelId}` - List all allocations for a hostel
- `DELETE /api/allocations/{id}` - Deallocate/vacate a bed

### Payments (`/api/payments`)
- `POST /api/payments/create` - Initiate mock/online payment
- `POST /api/payments/verify` - Complete transaction and issue receipt number
- `GET /api/payments/student/{studentId}` - Get student payment record & receipt
- `GET /api/payments/hostel/{hostelId}` - Get payments ledger for hostel
- `GET /api/payments/receipt/{receiptNumber}` - Fetch verified receipt by receipt number

---

## 🔑 Pre-configured Demo Accounts

All sample accounts are pre-seeded upon launch:

| Role | Email / Username | Password | Assigned Scope |
|---|---|---|---|
| **Super Admin** | `admin@hostel.com` | `Admin@123` | Full College Access |
| **Boys Warden** | `boyshead@hostel.com` | `Warden@123` | Boys Hostel (मुलांचे वसतिगृह) |
| **Girls Warden** | `girlshead@hostel.com` | `Warden@123` | Girls Hostel (मुलींचे वसतिगृह) |
| **Male Student (Allocated)** | `student@hostel.com` | `Student@123` | Room B-101, Bed B-101-01 (Paid) |
| **Female Student (Approved)** | `priya@hostel.com` | `Student@123` | Girls Hostel (Ready for Bed Allotment) |
| **Male Student (Pending)** | `amit@hostel.com` | `Student@123` | Boys Hostel (Awaiting Warden Review) |

> 💡 **Quick Login:** The Login page includes **1-Click Demo Buttons** to instantly populate credentials for any role!

---

## ⚙️ Prerequisites

1. **Java Development Kit (JDK):** Version 17 or higher (Java 21 / 22 recommended).
2. **Node.js:** Version 18.0 or higher.
3. **Apache Maven:** Version 3.8+ (A pre-configured Maven 3.9.6 path is provided in batch scripts).
4. **MySQL Database:** Version 8.0+ (Optional if using the default H2 profile).

---

## 🚀 Quick Start (One-Click Launch)

To start the backend and frontend on Windows:

### 1. Launch Full Stack (Backend + Frontend)
- **Node.js + React:** Double-click [`start-all-node.bat`](file:///c:/Users/Aadesh/OneDrive/Desktop/HostelManagement/start-all-node.bat)
- **Spring Boot + React:** Double-click [`start-all.bat`](file:///c:/Users/Aadesh/OneDrive/Desktop/HostelManagement/start-all.bat)

### 2. Launch Backend Independently (Port 8080)
- **Node.js Express Backend:**
  - One-Click: Double click [`run-backend-node.bat`](file:///c:/Users/Aadesh/OneDrive/Desktop/HostelManagement/run-backend-node.bat)
  - Terminal:
    ```cmd
    cd backend-node
    node server.js
    ```
- **Java Spring Boot Backend:**
  - One-Click MySQL Mode: Double click [`run-backend-mysql.bat`](file:///c:/Users/Aadesh/OneDrive/Desktop/HostelManagement/run-backend-mysql.bat)
  - One-Click Default / H2 Mode: Double click [`run-backend.bat`](file:///c:/Users/Aadesh/OneDrive/Desktop/HostelManagement/run-backend.bat)
  - Terminal:
    ```cmd
    cd backend
    mvnw.cmd spring-boot:run
    ```

### 3. Launch Frontend Independently (Port 5173)
- **One-Click Batch:** Double click [`run-frontend.bat`](file:///c:/Users/Aadesh/OneDrive/Desktop/HostelManagement/run-frontend.bat)
- **Terminal:**
  ```cmd
  cd frontend
  npm run dev
  ```

### 4. Open in Browser
- **Frontend Web Portal:** [http://localhost:5173](http://localhost:5173)
- **Backend API Endpoints:** [http://localhost:8080/api](http://localhost:8080/api)
- **Node.js API Health:** [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

## 🛠️ Database Setup Options

### Option A: Embedded Persistent H2 (Default - Zero Configuration)
The backend now runs **by default** on H2 file-based storage (`backend/data/hosteldb`).
- Requires zero external database server setup or passwords.
- Tables and sample data are automatically created and initialized.
- All student applications, room allocations, and payments are automatically saved to disk across restarts.

### Option B: MySQL 8.0+
If you wish to run on a local MySQL server instead:
1. Ensure your MySQL service is running.
2. Run the backend with the `mysql` profile:
   ```cmd
   cd backend
   mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
   ```
   Or set the environment variable: `SPRING_PROFILES_ACTIVE=mysql`.
3. To specify custom MySQL username/password, set `DB_USERNAME` and `DB_PASSWORD` or edit `application-mysql.properties`.
   ```cmd
   mvn clean package -DskipTests
   ```
3. Run the Spring Boot application:
   ```cmd
   mvn spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=h2"
   ```
4. Backend will start listening on port `8080`.

---

### Frontend Setup (React + Vite)

1. Open another terminal and navigate to the frontend directory:
   ```cmd
   cd frontend
   ```
2. Install npm dependencies:
   ```cmd
   npm install
   ```
3. Start the Vite development server:
   ```cmd
   npm run dev
   ```
4. Access the web interface at `http://localhost:5174`.

---

## 🔒 Environment Variables

Create a `.env` file in the root or `backend/` directory based on `.env.example`:

```env
# Database Credentials
DB_URL=jdbc:mysql://localhost:3306/hostel_management_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=root

# Security
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000

# Mock Payment Gateway Credentials
PAYMENT_API_KEY=mock_pay_key_ahilyanagar_2026
PAYMENT_SECRET=mock_pay_sec_9938472910394
```

---

## 🧪 Testing & Verification

### 1. Test Backend Health & API
You can verify the backend endpoints using PowerShell or cURL:
```powershell
# Check Hostels API
Invoke-RestMethod -Uri "http://localhost:8080/api/hostels" -Method Get

# Login as Super Admin
$body = @{ usernameOrEmail = "admin@hostel.com"; password = "Admin@123" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.accessToken

# Fetch Admin Dashboard Dynamic Metrics
Invoke-RestMethod -Uri "http://localhost:8080/api/dashboard/admin" -Method Get -Headers @{ Authorization = "Bearer $token" }
```

### 2. Verify Student Workflow on Frontend
1. Open `http://localhost:5174` and click **"मराठी / English"** in the top navigation to test instant bilingual toggle.
2. Click **Apply for Hostel** or Register a new student:
   - Notice how selecting `Male` automatically locks the hostel to `Boys Hostel`.
   - Selecting `Female` locks the hostel to `Girls Hostel`.
3. Log in as **Boys Warden** (`boyshead@hostel.com` / `Warden@123`):
   - Review pending student applications.
   - Click **Verify Documents**, then **Approve**.
   - Navigate to **Bed Allocation** and select an available room and bed (e.g., `B-101-02`).
4. Log back in as the student:
   - Notice the status timeline moves to **Approved** and **Room Allocated**.
   - Click **Make Payment** -> View pre-filled student details -> Click **Pay ₹ 15,000.00** via Razorpay Gateway (UPI QR, Card, Net Banking, or 1-Click Demo Pay).
   - View and print the generated college payment receipt voucher with Razorpay verification.

---

## 🚀 Deployment Guide

### Production Build
1. **Frontend:**
   ```cmd
   cd frontend
   npm run build
   ```
   The compiled static assets will be output to `frontend/dist/`.
2. **Backend:**
   ```cmd
   cd backend
   mvn clean package -DskipTests
   ```
   The executable JAR file will be located at `backend/target/hostel-management-backend-0.0.1-SNAPSHOT.jar`.
3. **Execution:**
   ```cmd
   java -jar backend/target/hostel-management-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
   ```

---

## 🎓 Academic Submission Details
- **Institution:** New Arts, Commerce and Science College, Ahilyanagar (Autonomous)
- **Degree:** M.Sc. Computer Science
- **Course:** Full-Stack Web Application Project
- **Specialization:** Advanced Java Enterprise Architectures & Modern Single-Page Web Applications

Developed with ❤️ for **New Arts, Commerce and Science College, Ahilyanagar**.
