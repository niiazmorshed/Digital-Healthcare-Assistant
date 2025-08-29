import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import UseAuth from '../../../Hooks/UseAuth';
import { appointmentAPI, doctorAPI } from '../../../services/api';
import RescheduleModal from './RescheduleModal';

export default function PatientDashboard() {
  const { userData } = UseAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({}); // Store doctor details by email
  const [error, setError] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appointment: null });
  const [queueEntries, setQueueEntries] = useState([]); // up to 4 entries

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await doctorAPI.getAll();
      if (response.success && response.data) {
        const doctorsMap = {};
        response.data.forEach(doctor => {
          doctorsMap[doctor.email] = doctor;
        });
        setDoctors(doctorsMap);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  }, []);

  const fetchPatientAppointments = useCallback(async () => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await appointmentAPI.getPatientAppointments(userData.uid);
      
      if (response.success) {
        setAppointments(response.data || []);
      } else {
        setError('Failed to load appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [userData?.uid]);

  // Build queue for the patient's next pending appointment
  const buildMyQueue = useCallback(async (sortedApps) => {
    try {
      const myNext = sortedApps.find(a => (a.status || '').toLowerCase() === 'pending');
      if (!myNext) {
        setQueueEntries([]);
        return;
      }
      const doctorEmail = myNext.doctorEmail;
      const response = await appointmentAPI.getDoctorAppointments(doctorEmail);
      if (!response.success) {
        setQueueEntries([]);
        return;
      }
      const all = response.data || [];
      const sameSlot = all.filter(a => (a.status || '').toLowerCase() === 'pending' && a.appointmentDate === myNext.appointmentDate && a.appointmentTime === myNext.appointmentTime)
        .sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0))
        .slice(0, 4)
        .map(a => ({ name: a.patientName, serial: a.serialNumber }));
      setQueueEntries(sameSlot);
    } catch (e) {
      console.debug('Unable to build queue', e);
      setQueueEntries([]);
    }
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await appointmentAPI.cancel(appointmentId);
      
      if (response.success) {
        toast.success('Appointment cancelled successfully!');
        await fetchPatientAppointments();
      } else {
        toast.error('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment. Please try again.');
    }
  };

  const handleRescheduleAppointment = (appointment) => {
    setRescheduleModal({ isOpen: true, appointment });
  };

  const handleRescheduleSuccess = () => {
    fetchPatientAppointments();
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({ isOpen: false, appointment: null });
  };

  useEffect(() => {
    fetchDoctors();
    fetchPatientAppointments();
  }, [fetchDoctors, fetchPatientAppointments]);

  const getDoctorName = (doctorEmail) => {
    if (!doctorEmail) return 'N/A';
    const doctor = doctors[doctorEmail];
    return doctor ? doctor.name || doctor.displayName || 'Dr. ' + doctorEmail.split('@')[0] : 'Dr. ' + doctorEmail.split('@')[0];
  };

  const getDoctorSpecialization = (doctorEmail) => {
    if (!doctorEmail) return 'N/A';
    const doctor = doctors[doctorEmail];
    return doctor ? doctor.specialization || doctor.department || 'General Medicine' : 'General Medicine';
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' && new Date(apt.appointmentDate) > new Date()
  );
  
  const pendingAppointments = appointments.filter(apt => 
    apt.status === 'pending'
  );
  
  const completedAppointments = appointments.filter(apt => 
    apt.status === 'completed'
  );

  // Sort appointments by date, time, then serialNumber
  const toMins = (t) => {
    if (!t) return 0;
    const [start] = String(t).split('-');
    const [h, m] = start.split(':').map(Number);
    return h * 60 + m;
  };
  const sortedAppointments = [...appointments].sort((a, b) => {
    const d = new Date(a.appointmentDate) - new Date(b.appointmentDate);
    if (d !== 0) return d;
    const tm = toMins(a.appointmentTime) - toMins(b.appointmentTime);
    if (tm !== 0) return tm;
    return (a.serialNumber || 0) - (b.serialNumber || 0);
  });

  // Refresh queue whenever sorted appointments change
  useEffect(() => {
    (async () => {
      await buildMyQueue(sortedAppointments);
    })();
  }, [sortedAppointments, buildMyQueue]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-64 w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.displayName || userData?.firstName || 'User')}&background=0D8ABC&color=fff&size=128`;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-200 shadow md:col-span-2">
          <div className="card-body">
            <h3 className="card-title mb-2">My Profile</h3>
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-base-300 border-4 border-white shadow">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <img src={avatarFallback} alt="avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <p><span className="font-semibold">Name:</span> {userData?.displayName || userData?.firstName || 'N/A'}</p>
                <p className="whitespace-nowrap"><span className="font-semibold">Email:</span> {userData?.email || 'N/A'}</p>
                <p><span className="font-semibold">Role:</span> {userData?.role || 'N/A'}</p>
                <p><span className="font-semibold">Member Since:</span> {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <p className="mt-3 text-sm opacity-80">Queue system: Each time slot allows up to 4 patients. Your serial is shown with each appointment.</p>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Upcoming</div>
            <div className="stat-value">{upcomingAppointments.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Completed</div>
            <div className="stat-value">{completedAppointments.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Pending</div>
            <div className="stat-value">{pendingAppointments.length}</div>
          </div>
        </div>

        {/* Queue card */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h3 className="card-title">Current Queue</h3>
            {queueEntries.length === 0 ? (
              <p className="opacity-70 text-sm">No pending queue for your next appointment.</p>
            ) : (
              <ul className="space-y-2">
                {queueEntries.map(q => (
                  <li key={q.serial} className="flex items-center gap-3">
                    <span className="badge">{q.serial}</span>
                    <span>{q.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">My Appointments</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Date</th>
                <th>Time</th>
                <th>Symptoms</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center opacity-70">No appointments found</td>
                </tr>
              ) : (
                sortedAppointments.map((appt) => {
                  const status = (appt.status || '').toLowerCase();
                  const doctorName = getDoctorName(appt.doctorEmail);
                  const doctorSpecialization = getDoctorSpecialization(appt.doctorEmail);
                  
                  return (
                    <tr key={appt._id}>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold">{doctorName}</span>
                          <span className="text-xs opacity-70">{appt.doctorEmail}</span>
                        </div>
                      </td>
                      <td>{doctorSpecialization}</td>
                      <td>{appt.appointmentDate}</td>
                      <td>{appt.appointmentTime}</td>
                      <td>{appt.symptoms || '-'}</td>
                      <td>
                        <span className={`badge ${status === 'confirmed' ? 'badge-success' : status === 'pending' ? 'badge-warning' : status === 'completed' ? 'badge-info' : status === 'cancelled' ? 'badge-error' : 'badge-ghost'}`}>
                          {status}
                        </span>
                        <span className="ml-2 text-sm opacity-80">Serial: <span className="badge">{appt.serialNumber || '-'}</span></span>
                      </td>
                      <td className="text-right">
                        {status === 'pending' && (
                          <div className="flex gap-1">
                            <button 
                              className="btn btn-xs btn-outline btn-error" 
                              onClick={() => handleCancelAppointment(appt._id)}
                            >
                              Cancel
                            </button>
                            <button 
                              className="btn btn-xs btn-outline btn-primary" 
                              onClick={() => handleRescheduleAppointment(appt)}
                            >
                              Reschedule
                            </button>
                          </div>
                        )}
                        {status === 'confirmed' && (
                          <div className="flex gap-1">
                            <button 
                              className="btn btn-xs btn-outline btn-error" 
                              onClick={() => handleCancelAppointment(appt._id)}
                            >
                              Cancel
                            </button>
                            <button 
                              className="btn btn-xs btn-outline btn-primary" 
                              onClick={() => handleRescheduleAppointment(appt)}
                            >
                              Reschedule
                            </button>
                          </div>
                        )}
                        {status === 'completed' && (
                          <span className="opacity-60">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Doctor Details Section */}
      {appointments.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">My Doctors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(doctors).filter(doctor => 
              appointments.some(appt => appt.doctorEmail === doctor.email)
            ).map((doctor) => {
              const doctorAppointments = appointments.filter(appt => appt.doctorEmail === doctor.email);
              const completedCount = doctorAppointments.filter(appt => appt.status === 'completed').length;
              const upcomingCount = doctorAppointments.filter(appt => appt.status === 'confirmed' && new Date(appt.appointmentDate) > new Date()).length;
              
              return (
                <div key={doctor.email} className="card bg-base-200 shadow">
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-bold overflow-hidden">
                        {doctor.photoURL ? (
                          <img src={doctor.photoURL} alt={doctor.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="card-title text-lg">{doctor.name || 'Dr. ' + doctor.email.split('@')[0]}</h4>
                        <p className="text-sm opacity-70">{doctor.specialization || doctor.department || 'General Medicine'}</p>
                      </div>
                    </div>
                    <p className="text-sm">{doctor.bio || 'Experienced healthcare professional'}</p>
                    <div className="stats stats-horizontal mt-3">
                      <div className="stat">
                        <div className="stat-title text-xs">Completed</div>
                        <div className="stat-value text-sm">{completedCount}</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title text-xs">Upcoming</div>
                        <div className="stat-value text-sm">{upcomingCount}</div>
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-3">
                      <button className="btn btn-xs btn-outline">View Profile</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Reschedule Modal */}
      <RescheduleModal
        appointment={rescheduleModal.appointment}
        isOpen={rescheduleModal.isOpen}
        onClose={closeRescheduleModal}
        onSuccess={handleRescheduleSuccess}
      />
    </div>
  );
}


