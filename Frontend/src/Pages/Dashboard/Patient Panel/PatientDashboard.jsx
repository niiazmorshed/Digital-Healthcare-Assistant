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

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await appointmentAPI.cancel(appointmentId);
      
      if (response.success) {
        toast.success('Appointment cancelled successfully!');
        // Refresh appointments
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

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h3 className="card-title">My Profile</h3>
            <p>ID: {userData?.uid?.slice(-6)?.toUpperCase() || 'N/A'}</p>
            <p>Name: {userData?.displayName || userData?.firstName || 'N/A'}</p>
            <p>Email: {userData?.email || 'N/A'}</p>
            <p>Role: {userData?.role || 'N/A'}</p>
            <p>Member Since: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</p>
            <div className="card-actions justify-end">
              <button className="btn btn-sm">Edit</button>
            </div>
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
                appointments.map((appt) => {
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

      {upcomingAppointments.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">Upcoming Appointments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAppointments.map((appt) => {
              const doctorName = getDoctorName(appt.doctorEmail);
              const doctorSpecialization = getDoctorSpecialization(appt.doctorEmail);
              
              return (
                <div key={appt._id} className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h4 className="card-title">{doctorName}</h4>
                    <p className="text-sm opacity-70">{doctorSpecialization}</p>
                    <p>Date: {appt.appointmentDate}</p>
                    <p>Time: {appt.appointmentTime}</p>
                    <p>Symptoms: {appt.symptoms || 'N/A'}</p>
                    <div className="card-actions justify-end">
                      <button 
                        className="btn btn-xs btn-outline btn-primary"
                        onClick={() => handleRescheduleAppointment(appt)}
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {completedAppointments.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">Recent Completed Appointments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedAppointments.slice(0, 3).map((appt) => {
              const doctorName = getDoctorName(appt.doctorEmail);
              const doctorSpecialization = getDoctorSpecialization(appt.doctorEmail);
              
              return (
                <div key={appt._id} className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h4 className="card-title">{doctorName}</h4>
                    <p className="text-sm opacity-70">{doctorSpecialization}</p>
                    <p>Date: {appt.appointmentDate}</p>
                    <p>Time: {appt.appointmentTime}</p>
                    <p>Symptoms: {appt.symptoms || 'N/A'}</p>
                    <div className="card-actions justify-end">
                      <button className="btn btn-xs btn-outline">View Details</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-bold">
                        {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
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


