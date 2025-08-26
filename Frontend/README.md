# Furni Flex 🪑

A modern, responsive furniture e-commerce web application built with React, featuring a clean UI design and seamless user experience for browsing and purchasing furniture online.

## 🌐 Live Demo

**[Visit Furni Flex](https://Digital Healthcare.web.app/)**

## ✨ Features

### 🛒 E-commerce Functionality

- **Product Catalog**: Browse through a curated collection of furniture items
- **Shopping Cart**: Add/remove items with persistent cart management
- **Product Categories**: Filter furniture by categories (Rocking Chair, Slide Chair, etc.)
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🔐 Authentication System

- **User Registration & Login**: Secure account creation and authentication
- **Social Authentication**: Login with Google and GitHub
- **Protected Routes**: Private route protection for authenticated users
- **User Profile Management**: Personalized user experience

### 🎨 User Interface

- **Modern Design**: Clean and intuitive interface using Tailwind CSS and DaisyUI
- **Dark Mode Support**: Toggle between light and dark themes
- **Smooth Animations**: Enhanced user experience with CSS animations
- **Mobile-First**: Responsive design that works seamlessly across all devices

### 📱 Additional Features

- **Customer Reviews**: Dedicated review section with testimonials
- **About Us Page**: Company information and CEO message
- **Newsletter Subscription**: Email subscription for updates
- **Toast Notifications**: Real-time feedback for user actions
- **Error Handling**: Custom error pages and graceful error handling

## 🛠️ Tech Stack

### Frontend

- **React 18.3.1** - Modern React with hooks and functional components
- **React Router DOM 6.26.1** - Client-side routing and navigation
- **Vite 5.4.1** - Fast build tool and development server
- **Tailwind CSS 3.4.10** - Utility-first CSS framework
- **DaisyUI 4.12.10** - Tailwind CSS component library

### Authentication & Database

- **Firebase 10.13.1** - Authentication, hosting, and backend services
- **Firebase Authentication** - Google and GitHub OAuth integration

### Additional Libraries

- **React Hot Toast** - Elegant toast notifications
- **React Icons** - Popular icon library
- **React Helmet** - Dynamic document head management
- **Axios** - HTTP client for API requests
- **Swiper** - Touch slider component
- **Lottie React** - Render After Effects animations
- **Animate.css** - CSS animation library

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Firebase account for backend services

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/niiazmorshed/Digital Healthcare.git
   cd Digital Healthcare
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 📂 Project Structure

```
Digital Healthcare/
├── public/                 # Static assets
│   ├── info.json          # Product data
│   ├── Animation-*.json   # Lottie animations
│   └── *.png, *.svg       # Images and icons
├── src/
│   ├── About Us/          # About page components
│   ├── Dark Mode/         # Dark mode toggle functionality
│   ├── Error/             # Error page components
│   ├── Firebase/          # Firebase configuration
│   ├── Footer/            # Footer component
│   ├── Hooks/             # Custom React hooks
│   ├── Layout/            # Layout components
│   ├── Our Review/        # Customer reviews section
│   ├── Pages/             # Main page components
│   │   ├── Banner/        # Hero section
│   │   ├── Categories/    # Product categories
│   │   ├── Home/          # Home page
│   │   ├── Login/         # Authentication pages
│   │   ├── Navbar/        # Navigation component
│   │   ├── Products/      # Product catalog
│   │   └── Register/      # User registration
│   ├── Provider/          # Context providers
│   ├── Routes/            # Route configuration
│   └── Storage/           # Local storage utilities
├── .firebase/             # Firebase deployment config
├── firebase.json          # Firebase configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── vite.config.js         # Vite build configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🌟 Key Components

### Authentication Flow

The application uses Firebase Authentication with support for:

- Email/Password authentication
- Google OAuth
- GitHub OAuth
- Protected route middleware

### State Management

- React Context API for global state management
- Custom hooks for authentication and data fetching
- Local storage integration for cart persistence

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Flexible grid layouts
- Adaptive navigation for different screen sizes

## 🚀 Deployment

The application is deployed on Firebase Hosting. To deploy:

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**

   ```bash
   firebase login
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## 👨‍💼 About the Developer

**Niaz Morshed** - Full Stack Developer

- 📧 Email: niazmorshedrafi@gmail.com
- 🌍 Location: Dhaka, Bangladesh
- 📱 Phone: +880-1734804733

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend services and hosting
- Tailwind CSS and DaisyUI for the beautiful UI components
- React community for the amazing ecosystem
- All beta testers and contributors

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/niiazmorshed">Niaz Morshed</a></p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
