import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorCard from './DoctorCard';
import AppointmentForm from './AppointmentForm';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            // Fetch from your backend API
            const response = await axios.get('http://localhost:5000/api/doctors');
            console.log('Fetched doctors:', response.data);
            
            if (response.data.success) {
                setDoctors(response.data.doctors);
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
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
                <h2>Loading doctors...</h2>
            </div>
        );
    }

    if (doctors.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>No doctors found</h2>
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
