# 🏥 Digital Healthcare Assistant

A comprehensive healthcare management system built with React, Firebase, and Node.js that connects patients with doctors through an intuitive appointment booking and management platform.

## 🌟 Features

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

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project setup
- Backend API server running

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/digital-healthcare-assistant.git
   cd digital-healthcare-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   VITE_API_URL=http://localhost:5000
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

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

## 🔐 Authentication

The application uses Firebase Authentication with multiple sign-in methods:

- Email/Password authentication
- Google OAuth
- GitHub OAuth

Users are automatically redirected to their appropriate dashboard based on their role (patient, doctor, or admin).

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

## 📊 API Integration

The frontend integrates with a comprehensive RESTful API:

- **User Management**: Registration, login, profile updates
- **Appointment Management**: CRUD operations for appointments
- **Doctor Management**: Doctor profiles and availability
- **Prescription System**: Prescription creation and management
- **Queue Management**: Real-time queue status and updates

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Your Name** - _Initial work_ - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Firebase for authentication and hosting
- Tailwind CSS and DaisyUI for the beautiful UI components
- React community for the excellent ecosystem
- All contributors who helped improve this project

## 📞 Support

If you have any questions or need support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for better healthcare management**
