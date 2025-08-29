import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import UseAuth from '../../Hooks/UseAuth';
import { appointmentAPI } from '../../services/api';

const AppointmentForm = ({ doctor, onClose }) => {
    const { user, userData } = UseAuth();
    const [loading, setLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [formData, setFormData] = useState({
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        appointmentDate: '',
        appointmentTime: '',
        symptoms: '',
        age: '',
        gender: ''
    });

    // Prefill email and name from authenticated user
    useEffect(() => {
        const authEmail = user?.email || userData?.email || '';
        const authName = userData?.displayName || user?.displayName || [userData?.firstName, userData?.lastName].filter(Boolean).join(' ') || '';

        setFormData(prev => ({
            ...prev,
            patientEmail: authEmail || prev.patientEmail,
            patientName: authName || prev.patientName,
        }));
    }, [user?.email, userData?.email, user?.displayName, userData?.displayName, userData?.firstName, userData?.lastName]);

    // Fetch available slots when date changes
    const fetchAvailableSlots = async (selectedDate) => {
        if (!selectedDate) {
            setAvailableSlots([]);
            return;
        }

        setLoadingSlots(true);
        try {
            const response = await appointmentAPI.getAvailableSlots(
                doctor.contactInfo?.email || doctor.email,
                selectedDate
            );
            
            if (response.success) {
                setAvailableSlots(response.data || []);
            } else {
                setAvailableSlots([]);
            }
        } catch (error) {
            console.error('Error fetching available slots:', error);
            setAvailableSlots([]);
            toast.error('Failed to load available slots.');
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // If date changes, fetch available slots and reset time
        if (name === 'appointmentDate') {
            fetchAvailableSlots(value);
            setFormData(prev => ({
                ...prev,
                appointmentTime: '' // Reset time when date changes
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if user is authenticated
        if (!user) {
            toast.error('Please login to book an appointment');
            return;
        }

        // Check if user is a patient
        if (userData?.role !== 'patient') {
            toast.error('Only patients can book appointments');
            return;
        }
        
        setLoading(true);

        try {
            // Validate chosen slot using available-slots endpoint
            const availRes = await appointmentAPI.getAvailableSlots(
                doctor.contactInfo?.email || doctor.email,
                formData.appointmentDate
            );
            const freeSlots = (availRes?.data || availRes?.slots || []);
            const isFree = Array.isArray(freeSlots) && freeSlots.includes(formData.appointmentTime);
            if (!isFree) {
                toast.error('This time slot is no longer available. Please choose another time.');
                await fetchAvailableSlots(formData.appointmentDate);
                setLoading(false);
                return;
            }

            // Prepare appointment data according to your backend schema
            const appointmentData = {
                patientId: user.uid, // Firebase UID
                doctorEmail: doctor.contactInfo?.email || doctor.email, // Doctor's email
                patientName: formData.patientName,
                patientEmail: formData.patientEmail,
                patientPhone: formData.patientPhone,
                patientAge: parseInt(formData.age),
                patientGender: formData.gender,
                appointmentDate: formData.appointmentDate,
                appointmentTime: formData.appointmentTime,
                symptoms: formData.symptoms
            };

            const response = await appointmentAPI.create(appointmentData);

            if (response.success) {
                toast.success(`Appointment booked with ${doctor.name} on ${formData.appointmentDate} at ${formData.appointmentTime}`);
                setTimeout(() => onClose(), 1200);
            }
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error('Invalid appointment data. Please check your information.');
            } else if (error.response?.status === 409) {
                toast.error('Appointment slot already booked. Please choose another time.');
            } else if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
            } else {
                toast.error('Error booking appointment. Please try again.');
            }
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get tomorrow's date as minimum date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    // Extract fee details - PROPERLY HANDLE THE OBJECT
    const fee = doctor?.consultationFee || { amount: 50, currency: 'BDT' };
    const feeDisplay = typeof fee === 'object' 
        ? `${fee.currency === 'BDT' ? '৳' : '$'}${fee.amount}`
        : `৳${fee}`;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <Toaster position="top-center" reverseOrder={false} />
            <div style={{
                background: 'white',
                borderRadius: '10px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '2rem'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{ margin: 0 }}>Book Appointment</h2>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '2rem',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>
                
                <div style={{
                    background: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                }}>
                    <p style={{ margin: '0.3rem 0' }}>
                        <strong>Doctor:</strong> {doctor?.name || 'N/A'}
                    </p>
                    <p style={{ margin: '0.3rem 0' }}>
                        <strong>Specialization:</strong> {doctor?.specialization || 'General'}
                    </p>
                    <p style={{ margin: '0.3rem 0' }}>
                        <strong>Department:</strong> {doctor?.department || 'General Medicine'}
                    </p>
                    <p style={{ margin: '0.3rem 0' }}>
                        <strong>Fee:</strong> {feeDisplay}
                    </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="patientName"
                            value={formData.patientName}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                            style={{
                                width: '100%',
                                padding: '0.7rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            name="patientEmail"
                            value={formData.patientEmail}
                            onChange={handleChange}
                            required
                            readOnly
                            placeholder="your.email@example.com"
                            style={{
                                width: '100%',
                                padding: '0.7rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                backgroundColor: '#f3f4f6'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Phone *
                        </label>
                        <input
                            type="tel"
                            name="patientPhone"
                            value={formData.patientPhone}
                            onChange={handleChange}
                            required
                            placeholder="01XXXXXXXXX"
                            style={{
                                width: '100%',
                                padding: '0.7rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                Age *
                            </label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                required
                                min="1"
                                max="120"
                                placeholder="Your age"
                                style={{
                                    width: '100%',
                                    padding: '0.7rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                Gender *
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.7rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px'
                                }}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                Date *
                            </label>
                            <input
                                type="date"
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                onChange={handleChange}
                                min={minDate}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.7rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                Time *
                            </label>
                            <select
                                name="appointmentTime"
                                value={formData.appointmentTime}
                                onChange={handleChange}
                                required
                                disabled={loadingSlots || !formData.appointmentDate}
                                style={{
                                    width: '100%',
                                    padding: '0.7rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    opacity: loadingSlots || !formData.appointmentDate ? 0.6 : 1
                                }}
                            >
                                <option value="">
                                    {loadingSlots ? 'Loading slots...' : !formData.appointmentDate ? 'Select Date First' : 'Select Time'}
                                </option>
                                {availableSlots.map((slot) => (
                                    <option key={slot} value={slot}>
                                        {slot}
                                    </option>
                                ))}
                            </select>
                            {formData.appointmentDate && availableSlots.length === 0 && !loadingSlots && (
                                <p style={{ 
                                    fontSize: '0.8rem', 
                                    color: '#e74c3c', 
                                    marginTop: '0.5rem',
                                    fontStyle: 'italic'
                                }}>
                                    No available slots for this date. Please select another date.
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Describe Your Symptoms
                        </label>
                        <textarea
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Please describe your symptoms or reason for visit..."
                            style={{
                                width: '100%',
                                padding: '0.7rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            type="submit" 
                            disabled={loading || loadingSlots || availableSlots.length === 0}
                            style={{
                                flex: 1,
                                padding: '0.9rem',
                                background: (loading || loadingSlots || availableSlots.length === 0) ? '#95a5a6' : '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: (loading || loadingSlots || availableSlots.length === 0) ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? 'Booking...' : 'Book Appointment'}
                        </button>
                        <button 
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '0.9rem',
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentForm;
