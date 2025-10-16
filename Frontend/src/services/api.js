import axios from 'axios';

// Prefer env var in production, fallback to localhost for dev
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : 'digital-healthcare-assistant.vercel.app/api';
// Note: Set VITE_API_BASE_URL to your backend, e.g. https://your-backend-domain.com/api
// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API functions
export const userAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (uid, email) => {
    try {
      const response = await apiClient.post('/users/login', { uid, email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user by UID
  getUserByUID: async (uid) => {
    try {
      const response = await apiClient.get(`/users/${uid}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (uid, updateData) => {
    try {
      const response = await apiClient.put(`/users/${uid}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Appointment API functions
export const appointmentAPI = {
  // Create appointment (Patient side)
  create: async (appointmentData) => {
    try {
      const response = await apiClient.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get doctor's appointments (Doctor side)
  getDoctorAppointments: async (doctorEmail) => {
    try {
      const response = await apiClient.get(`/appointments/doctor/${doctorEmail}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get patient's appointments (Patient side)
  getPatientAppointments: async (patientId) => {
    try {
      const response = await apiClient.get(`/appointments/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check slot availability (for booking and rescheduling)
  checkSlotAvailability: async (doctorEmail, appointmentDate, appointmentTime, excludeAppointmentId = null) => {
    try {
      const params = new URLSearchParams({
        doctorEmail,
        appointmentDate,
        appointmentTime
      });
      if (excludeAppointmentId) {
        params.append('excludeAppointmentId', excludeAppointmentId);
      }
      const response = await apiClient.get(`/appointments/check-slot?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get available slots for a specific date
  getAvailableSlots: async (doctorEmail, appointmentDate, excludeAppointmentId) => {
    try {
      const params = new URLSearchParams({
        doctorEmail,
        appointmentDate
      });
      if (excludeAppointmentId) {
        params.append('excludeAppointmentId', excludeAppointmentId);
      }
      const response = await apiClient.get(`/appointments/available-slots?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update appointment status (Doctor side)
  updateStatus: async (appointmentId, status) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reschedule appointment (Patient side)
  reschedule: async (appointmentId, updateData) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel appointment (Patient side)
  cancel: async (appointmentId) => {
    try {
      const response = await apiClient.delete(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all appointments (Admin side)
  getAll: async () => {
    try {
      const response = await apiClient.get('/appointments');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // New methods for request-based system
  getRequests: async (doctorEmail) => {
    try {
      const response = await apiClient.get(`/appointments/requests/${doctorEmail}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  approveRequest: async (appointmentId) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/approve`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  rejectRequest: async (appointmentId, rejectionReason) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/reject`, { rejectionReason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add prescription to appointment
  addPrescription: async (appointmentId, prescriptionData) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/prescription`, prescriptionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add prescription to patient collection
  addPrescriptionToPatient: async (patientEmail, prescriptionData) => {
    try {
      const response = await apiClient.put(`/patients/${patientEmail}/prescription`, prescriptionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get patient data from patient collection
  getPatientData: async (patientEmail) => {
    try {
      const response = await apiClient.get(`/patients/profile/${patientEmail}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all patients for a doctor
  getDoctorPatients: async (doctorEmail) => {
    try {
      const response = await apiClient.get(`/doctors/${doctorEmail}/patients`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get completed patients for a doctor
  getCompletedPatients: async (doctorEmail) => {
    try {
      const response = await apiClient.get(`/patients/${doctorEmail}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Doctor API functions
export const doctorAPI = {
  // Get all doctors
  getAll: async () => {
    try {
      const response = await apiClient.get('/doctors');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get doctor by ID
  getById: async (doctorId) => {
    try {
      const response = await apiClient.get(`/doctors/${doctorId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
