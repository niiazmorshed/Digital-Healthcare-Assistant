import React from 'react';

const DoctorCard = ({ doctor, onBookAppointment }) => {
    // Provide default values to prevent undefined errors
    const {
        name = 'Doctor Name',
        specialization = 'General',
        qualification = '',
        experience = 0,
        department = 'General Medicine',
        rating = 4.5,
        image = '',
        availableDays = [],
        consultationFee = { amount: 50, currency: 'USD' }, // Handle as object
        availableTimeSlots = []
    } = doctor || {};

    return (
        <div style={{
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            transition: 'transform 0.3s'
        }}>
            <div style={{
                width: '100%',
                height: '200px',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {image ? (
                    <img 
                        src={image}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div style="font-size: 48px;">👨‍⚕️</div>';
                        }}
                    />
                ) : (
                    <div style={{ fontSize: '48px' }}>👨‍⚕️</div>
                )}
            </div>
            
            <div style={{ padding: '1.5rem' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>{name}</h3>
                <p style={{ color: '#3498db', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {specialization}
                </p>
                {qualification && (
                    <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {qualification}
                    </p>
                )}
                
                <div style={{ background: '#f8f9fa', padding: '0.8rem', borderRadius: '8px', margin: '1rem 0' }}>
                    {experience > 0 && (
                        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                            <span>🏥</span> {experience} years experience
                        </p>
                    )}
                    {department && (
                        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                            <span>🏢</span> {department}
                        </p>
                    )}
                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                        <span>⭐</span> Rating: {rating}/5
                    </p>
                </div>

                {availableDays && availableDays.length > 0 && (
                    <div style={{ margin: '1rem 0' }}>
                        <strong>Available Days:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {availableDays.map((day, index) => (
                                <span key={index} style={{
                                    background: '#e3f2fd',
                                    color: '#1976d2',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '15px',
                                    fontSize: '0.85rem'
                                }}>
                                    {day}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {availableTimeSlots && availableTimeSlots.length > 0 && (
                    <div style={{ margin: '1rem 0' }}>
                        <strong>Time Slots:</strong>
                        <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                            {availableTimeSlots.join(', ')}
                        </p>
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem',
                    background: '#f0f8ff',
                    borderRadius: '8px',
                    margin: '1rem 0'
                }}>
                    <strong>Consultation Fee:</strong>
                    <span style={{ color: '#27ae60', fontSize: '1.3rem', fontWeight: 'bold' }}>
                        {/* Properly handle the fee object */}
                        {consultationFee.currency === 'BDT' ? '৳' : '$'}
                        {consultationFee.amount || 50}
                    </span>
                </div>

                <button 
                    onClick={() => onBookAppointment(doctor)}
                    style={{
                        width: '100%',
                        padding: '0.9rem',
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#2980b9'}
                    onMouseOut={(e) => e.target.style.background = '#3498db'}
                >
                    Book Appointment
                </button>
            </div>
        </div>
    );
};

export default DoctorCard;
