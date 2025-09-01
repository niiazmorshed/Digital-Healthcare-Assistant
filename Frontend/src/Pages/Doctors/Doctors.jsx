import { useEffect, useState } from 'react';
import Footer from '../../Footer/Footer';
import { doctorAPI } from '../../services/api';
import AppointmentForm from './AppointmentForm';
import DoctorCard from './DoctorCard';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching doctors from API...');
            
            // Use the new API service
            const response = await doctorAPI.getAll();
            console.log('API response:', response);
            
            // Handle the response format
            if (response.success && response.data) {
                console.log('Setting doctors from response.data:', response.data);
                setDoctors(response.data);
            } else if (response.success && response.doctors) {
                console.log('Setting doctors from response.doctors:', response.doctors);
                setDoctors(response.doctors);
            } else if (Array.isArray(response)) {
                console.log('Setting doctors from direct array:', response);
                setDoctors(response);
            } else if (response.data) {
                console.log('Setting doctors from response.data (no success flag):', response.data);
                setDoctors(response.data);
            } else {
                console.error('Unexpected response format:', response);
                setError('Invalid response format from server');
                setDoctors([]);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            console.error('Error details:', error.response?.data);
            setError('Failed to load doctors. Please try again later.');
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = (doctor) => {
        setSelectedDoctor(doctor);
        setShowAppointmentForm(true);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <h2>Loading doctors...</h2>
                <p style={{ color: '#666' }}>Please wait while we fetch the latest information</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
                <h2>Error Loading Doctors</h2>
                <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
                <button 
                    onClick={fetchDoctors}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (doctors.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👨‍⚕️</div>
                <h2>No doctors found</h2>
                <p style={{ color: '#666' }}>We couldn&apos;t find any doctors at the moment.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
                Our Doctors
            </h1>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '2rem' 
            }}>
                {doctors.map((doctor) => (
                    <DoctorCard 
                        key={doctor._id} 
                        doctor={doctor} 
                        onBookAppointment={handleBookAppointment}
                    />
                ))}
            </div>
            
            {showAppointmentForm && selectedDoctor && (
                <AppointmentForm 
                    doctor={selectedDoctor}
                    onClose={() => {
                        setShowAppointmentForm(false);
                        setSelectedDoctor(null);
                    }}
                />
            )}
        </div>
    );
};

export default Doctors;
