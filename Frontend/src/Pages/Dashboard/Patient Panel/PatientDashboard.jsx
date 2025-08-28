import { useCallback, useEffect, useState } from 'react';
import UseAuth from '../../../Hooks/UseAuth';
import { appointmentAPI } from '../../../services/api';

export default function PatientDashboard() {
  const { userData } = UseAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchPatientAppointments();
  }, [fetchPatientAppointments]);

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
                  <td colSpan={6} className="text-center opacity-70">No appointments found</td>
                </tr>
              ) : (
                appointments.map((appt) => {
                  const status = (appt.status || '').toLowerCase();
                  return (
                    <tr key={appt._id}>
                      <td>{appt.doctorName || 'N/A'}</td>
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
                          <button className="btn btn-xs btn-outline">Cancel</button>
                        )}
                        {status === 'confirmed' && (
                          <button className="btn btn-xs btn-outline">Reschedule</button>
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
            {upcomingAppointments.map((appt) => (
              <div key={appt._id} className="card bg-base-200 shadow">
                <div className="card-body">
                  <h4 className="card-title">{appt.doctorName}</h4>
                  <p>Date: {appt.appointmentDate}</p>
                  <p>Time: {appt.appointmentTime}</p>
                  <p>Symptoms: {appt.symptoms || 'N/A'}</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-xs btn-outline">Reschedule</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {completedAppointments.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">Recent Completed Appointments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedAppointments.slice(0, 3).map((appt) => (
              <div key={appt._id} className="card bg-base-200 shadow">
                <div className="card-body">
                  <h4 className="card-title">{appt.doctorName}</h4>
                  <p>Date: {appt.appointmentDate}</p>
                  <p>Time: {appt.appointmentTime}</p>
                  <p>Symptoms: {appt.symptoms || 'N/A'}</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-xs btn-outline">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


