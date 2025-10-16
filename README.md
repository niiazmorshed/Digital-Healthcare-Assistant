# 🏥 Digital Healthcare Assistant

> A full-stack healthcare management platform connecting patients and doctors with a streamlined appointment, approval, queue, and prescription workflow.

<div align="center">

👤 **[Developer](https://github.com/niiazmorshed)**

</div>

<div align="center">

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

## 🧪 Testing Credentials

<div align="center">

### 🎯 Quick Start - Use These Accounts to Test the Platform

</div>

| Role          | Email                  | Password | Access                          |
| ------------- | ---------------------- | -------- | ------------------------------- |
| 🩺 **Doctor** | `fahim@healthcare.com` | `1234Aa` | Approve appointments, prescribe |
| 🩺 **Doctor** | `sakib@healthcare.com` | `1234Aa` | Approve appointments, prescribe |
| 🩺 **Doctor** | `samia@healthcare.com` | `1234Aa` | Approve appointments, prescribe |
| 🩺 **Doctor** | `labib@healthcare.com` | `1234Aa` | Approve appointments, prescribe |

> Regular users who sign in (including Google) are Patients by default. Doctor accounts are manually provisioned in the database and cannot be self-registered.

---

## 📋 Table of Contents

- [About](#-about)
- [Key Features](#-key-features)
- [Authentication & Roles](#-authentication--roles)
- [Appointment & Queue Flow](#-appointment-and-queue-flow)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [API Integration](#-api-integration)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Authors](#-authors)

---

## 🌟 About

**Digital Healthcare Assistant** is a modern healthcare platform built with the MERN stack and Firebase Authentication. Patients can book appointments in fixed capacity slots, doctors can approve requests which moves patients into a live queue, and prescriptions are generated and visible in patient dashboards.

### ⚡ Quick Summary

- Role-based access: Patients (default), Doctors (manually provisioned), Admin
- Appointment slots with capacity limit (max 4 patients per slot)
- Doctor approval moves patients into the real-time queue
- Prescription generation and viewing for completed appointments

---

## 🌟 Key Features

### 👥 Multi-Role System

- **Patient Dashboard**: Book appointments, view queue status, manage prescriptions
- **Doctor Dashboard**: Manage appointments, approve/reject requests, write prescriptions
- **Admin Panel**: System-wide management and oversight

### 🎯 Core Functionality

#### For Patients

- **Appointment Booking**: Browse doctors and book appointments with detailed forms
- **Queue Management**: Real-time queue status with serial numbers and estimated times
- **Appointment Management**: View, reschedule, and cancel appointments
- **Prescription Access**: View and download prescriptions from completed appointments
- **Payment Integration**: Payment confirmation system with toast notifications
- **Profile Management**: Update personal information and view appointment history

#### For Doctors

- **Appointment Requests**: Review and approve/reject patient appointment requests
- **Queue Management**: View current patient queue with serial numbers and times
- **Prescription System**: Write and manage patient prescriptions
- **Patient Records**: Access patient history and completed appointments
- **Status Updates**: Mark appointments as completed, cancelled, or in-progress

### 🔧 Technical Features

- **Real-time Queue System**: Dynamic queue management with 15-minute time slots
- **Serial Number Assignment**: Automatic serial number assignment based on booking order
- **Toast Notifications**: User-friendly notifications for all actions
- **Responsive Design**: Mobile-first design with Tailwind CSS and DaisyUI
- **Authentication**: Firebase Authentication with Google and GitHub OAuth
- **API Integration**: RESTful API integration with axios
- **Form Validation**: Comprehensive form validation and error handling

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind CSS
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **Swiper** - Touch slider for banner components
- **Axios** - HTTP client for API calls

### Backend Integration

- **Node.js/Express** - RESTful API server
- **MongoDB** - NoSQL database
- **Firebase Authentication** - User authentication and authorization

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project setup
- Backend API server running

### 1) Clone the repository

```bash
git clone https://github.com/yourusername/digital-healthcare-assistant.git
cd digital-healthcare-assistant
```

### 2) Frontend setup

```bash
cd Frontend
npm install
```

Create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Run the dev server:

```bash
npm run dev
```

### 3) Backend setup

```bash
cd ../Backend
npm install
```

Create `Backend/.env` (example):

```env
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
PORT=5000
```

Start the API server:

```bash
npm start
```

---

## 📁 Project Structure

```
src/
├── Pages/
│   ├── Dashboard/
│   │   ├── Doctor Panel/          # Doctor dashboard components
│   │   ├── Patient Panel/         # Patient dashboard components
│   │   └── Admin Pannel/          # Admin panel components
│   ├── Doctors/                   # Doctor listing and appointment booking
│   ├── Home/                      # Landing page
│   ├── Login/                     # Authentication
│   ├── Register/                  # User registration
│   ├── Banner/                    # Homepage banner
│   └── Navbar/                    # Navigation component
├── Layout/                        # Layout components
├── Routes/                        # Routing configuration
├── Services/                      # API service functions
├── Hooks/                         # Custom React hooks
├── Provider/                      # Context providers
├── Footer/                        # Footer component
├── About Us/                      # About page
├── Error/                         # Error handling
├── Firebase/                      # Firebase configuration
├── Dark Mode/                     # Dark mode components
└── assets/                        # Static assets
```

---

## 🔐 Authentication & Roles

The application uses Firebase Authentication with multiple sign-in methods:

- Email/Password authentication
- Google OAuth
- GitHub OAuth

Users are automatically redirected to their appropriate dashboard based on their role (patient, doctor, or admin).

### Role Provisioning and Access Control

- New users who sign up or log in with Google are assigned the **Patient** role by default.
- **Doctor** accounts are manually provisioned in the database and cannot be self-registered.
- Only provisioned doctors can access the doctor dashboard and approve appointments.

### Demo Doctor Accounts

Use the following doctor accounts for QA and demos:

- `fahim@healthcare.com`
- `sakib@healthcare.com`
- `samia@healthcare.com`
- `labib@healthcare.com`

Password for all: `1234Aa`

> Note: These accounts are provisioned in the database. Regular users cannot become doctors unless manually added by an admin/developer.

## 📱 Key Components

### Patient Dashboard

- **Queue System**: Real-time queue display with serial numbers and estimated times
- **Appointment Management**: View, reschedule, and cancel appointments
- **Prescription Access**: View prescriptions from completed appointments
- **Payment System**: Payment confirmation with toast notifications

### Doctor Dashboard

- **Request Management**: Approve or reject patient appointment requests
- **Queue Management**: View current patient queue with status indicators
- **Prescription Writing**: Comprehensive prescription management system
- **Patient Records**: Access patient history and completed appointments

### Appointment Booking

- **Doctor Selection**: Browse available doctors with detailed profiles
- **Slot Availability**: Check real-time slot availability
- **Booking Form**: Comprehensive appointment booking with validation
- **Confirmation**: Immediate booking confirmation and status updates

### Appointment and Queue Flow

1. Patients can book an available time slot with a doctor.
2. Each time slot supports up to **4 patients maximum**.
3. Bookings remain pending until the doctor reviews them.
4. When a doctor approves an appointment, the patient is moved into the **active queue** for that session.
5. Doctors can write and attach **prescriptions** to completed appointments.
6. Patients can view their prescriptions in their **Patient Dashboard**.

```
PATIENT → Book slot (capacity ≤ 4) → Pending
              ↓ (Doctor approves)
          Queue position assigned → Visit/Complete → Prescription available
```

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with responsive layouts
- **Modern UI**: Clean, professional design using Tailwind CSS and DaisyUI
- **Toast Notifications**: User-friendly feedback for all actions
- **Loading States**: Skeleton loading and progress indicators
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Form Validation**: Real-time form validation with helpful error messages

## 🔄 Queue Management System

The application implements a sophisticated queue management system:

- **Serial Number Assignment**: Automatic assignment based on booking order (1-4 per time slot)
- **Time Slot Calculation**: 15-minute intervals within 1-hour slots
- **Real-time Updates**: Dynamic queue updates as appointments are processed
- **Status Tracking**: Current, next, and estimated time indicators

---

## 📊 API Integration

The frontend integrates with a comprehensive RESTful API:

- **User Management**: Registration, login, profile updates
- **Appointment Management**: CRUD operations for appointments
- **Doctor Management**: Doctor profiles and availability
- **Prescription System**: Prescription creation and management
- **Queue Management**: Real-time queue status and updates

---

## 🚀 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Other Platforms

The application can be deployed to any static hosting platform:

- Vercel
- Netlify
- GitHub Pages
- AWS S3

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **Niaz Morshed** - [@niiazmorshed](https://github.com/niiazmorshed)

## 🙏 Acknowledgments

- Firebase for authentication and hosting
- Tailwind CSS and DaisyUI for the beautiful UI components
- React community for the excellent ecosystem
- All contributors who helped improve this project

## 📞 Support

If you have any questions or need support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for better healthcare management by Niaz Morshed**
