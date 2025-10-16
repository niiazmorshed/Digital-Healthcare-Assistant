import React from 'react';

const DoctorCard = ({ doctor, onBookAppointment }) => {
    const {
        name = 'Doctor Name',
        specialization = 'General',
        qualification = '',
        experience = 0,
        department = 'General Medicine',
        rating = 4.5,
        image = '',
        photoURL = '',
        bio = 'Dedicated healthcare professional providing compassionate, evidence-based care.',
        availableDays = [],
        consultationFee = { amount: 50, currency: 'USD' },
        availableTimeSlots = []
    } = doctor || {};

    const currencySymbol = consultationFee.currency === 'BDT' ? '৳' : '$';
    const coverImage = photoURL || image;

    const AVATAR_SIZE = 144; // diameter in px

    return (
        <div style={{
            position: 'relative',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            width: '100%',
            maxWidth: '360px',
            margin: '0 auto'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow='0 10px 26px rgba(0,0,0,0.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.08)'; }}
        >
            {/* Top band that the avatar slightly overlaps */}
            <div style={{
                width: '100%',
                height: '96px',
                background: '#eef2f7'
            }} />

            {/* Centered circular avatar overlapping the top band */}
            <div style={{
                position: 'absolute',
                top: '96px',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${AVATAR_SIZE}px`,
                height: `${AVATAR_SIZE}px`,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #ffffff',
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                background: '#ffffff'
            }}>
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style="font-size: 42px; display:grid; place-items:center; height:100%">👨‍⚕️</div>'; }}
                    />
                ) : (
                    <div style={{ fontSize: '42px', display: 'grid', placeItems: 'center', height: '100%' }}>👨‍⚕️</div>
                )}
            </div>
            
            <div style={{ padding: '1.25rem', paddingTop: `${AVATAR_SIZE / 2 + 16}px` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '0.25rem', fontSize: '1.1rem', fontWeight: 700 }}>{name}</h3>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>{currencySymbol}{consultationFee.amount || 50}</span>
                </div>
                <p style={{ color: '#2563eb', fontWeight: 600, marginBottom: '0.25rem' }}>{specialization}</p>
                {qualification && (
                    <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{qualification}</p>
                )}
                {bio && (
                    <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.4, marginBottom: '0.75rem' }}>{bio}</p>
                )}
                
                <div style={{ background: '#f9fafb', padding: '0.6rem 0.75rem', borderRadius: '10px', margin: '0.6rem 0' }}>
                    {experience > 0 && (
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>
                            <span>🏥</span> {experience} years experience
                        </p>
                    )}
                    {department && (
                        <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>
                            <span>🏢</span> {department}
                        </p>
                    )}
                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>
                        <span>⭐</span> {rating}/5
                    </p>
                </div>

                {availableDays && availableDays.length > 0 && (
                    <div style={{ margin: '0.5rem 0' }}>
                        <strong style={{ fontSize: '0.85rem' }}>Available Days:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                            {availableDays.map((day, index) => (
                                <span key={index} style={{
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem'
                                }}>
                                    {day}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {availableTimeSlots && availableTimeSlots.length > 0 && (
                    <div style={{ margin: '0.5rem 0' }}>
                        <strong style={{ fontSize: '0.85rem' }}>Time Slots:</strong>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            {availableTimeSlots.join(', ')}
                        </p>
                    </div>
                )}

                <button 
                    onClick={() => onBookAppointment(doctor)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#0066cc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#0052a3'}
                    onMouseOut={(e) => e.target.style.background = '#0066cc'}
                >
                    Book Appointment
                </button>
            </div>
        </div>
    );
};

export default DoctorCard;
