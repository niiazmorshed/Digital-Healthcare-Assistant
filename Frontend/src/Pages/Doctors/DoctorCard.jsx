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
        <div
            className="relative bg-base-100 text-base-content rounded-xl shadow hover:shadow-xl transition-all duration-200 w-full max-w-[360px] mx-auto"
        >
            {/* Top band that the avatar slightly overlaps */}
            <div className="w-full h-24 bg-base-200" />

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
            
            <div className="p-5" style={{ paddingTop: `${AVATAR_SIZE / 2 + 16}px` }}>
                <div className="flex items-baseline justify-between">
                    <h3 className="mb-1 text-[1.1rem] font-bold">{name}</h3>
                    <span className="text-success font-bold">{currencySymbol}{consultationFee.amount || 50}</span>
                </div>
                <p className="text-primary font-semibold mb-1">{specialization}</p>
                {qualification && (
                    <p className="opacity-70 text-sm mb-2">{qualification}</p>
                )}
                {bio && (
                    <p className="text-sm leading-relaxed mb-3">{bio}</p>
                )}
                
                <div className="bg-base-200 rounded-lg px-3 py-2 my-2">
                    {experience > 0 && (
                        <p className="text-sm my-1">
                            <span>🏥</span> {experience} years experience
                        </p>
                    )}
                    {department && (
                        <p className="text-sm my-1">
                            <span>🏢</span> {department}
                        </p>
                    )}
                    <p className="text-sm my-1">
                        <span>⭐</span> {rating}/5
                    </p>
                </div>

                {availableDays && availableDays.length > 0 && (
                    <div className="my-2">
                        <strong className="text-sm">Available Days:</strong>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {availableDays.map((day, index) => (
                                <span key={index} className="badge badge-ghost text-xs">
                                    {day}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {availableTimeSlots && availableTimeSlots.length > 0 && (
                    <div className="my-2">
                        <strong className="text-sm">Time Slots:</strong>
                        <p className="opacity-70 text-sm mt-1">
                            {availableTimeSlots.join(', ')}
                        </p>
                    </div>
                )}

                <button
                    onClick={() => onBookAppointment(doctor)}
                    className="btn btn-primary w-full"
                >
                    Book Appointment
                </button>
            </div>
        </div>
    );
};

export default DoctorCard;
