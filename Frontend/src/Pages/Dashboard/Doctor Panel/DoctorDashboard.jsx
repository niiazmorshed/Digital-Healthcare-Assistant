import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import UseAuth from '../../../Hooks/UseAuth';
import { appointmentAPI } from '../../../services/api';

const DoctorDashboard = () => {
  const { userData } = UseAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('appointments');
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [queueEntries, setQueueEntries] = useState([]); // up to 4 entries for next pending slot

  const buildPatientsFromAppointments = useCallback((all) => {
    const map = new Map();
    const sorted = [...all].sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    for (const apt of sorted) {
      const email = apt.patientEmail;
      if (!email) continue;
      const existing = map.get(email) || {
        email,
        name: apt.patientName,
        phone: apt.patientPhone,
        age: apt.patientAge,
        gender: apt.patientGender,
        visits: 0,
        history: [],
        lastVisit: null,
      };
      existing.visits += 1;
      existing.history.push(apt);
      existing.lastVisit = apt.appointmentDate || existing.lastVisit;
      map.set(email, existing);
    }
    return Array.from(map.values()).sort((a, b) => (new Date(b.lastVisit) - new Date(a.lastVisit)));
  }, []);

  const fetchDoctorAppointments = useCallback(async () => {
    if (!userData?.email) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await appointmentAPI.getDoctorAppointments(userData.email);
      
      if (response.success) {
        const allAppointments = response.data || [];
        setAppointments(allAppointments);
        setPatients(buildPatientsFromAppointments(allAppointments));
        setDoctorProfile({
          name: userData.displayName,
          email: userData.email,
          role: userData.role,
          photoURL: userData.photoURL || '',
        });
      } else {
        setError('Failed to load appointments');
        toast.error('Failed to load appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [userData?.email, buildPatientsFromAppointments, userData?.displayName, userData?.role]);

  const handleUpdateAppointmentStatus = useCallback(async (appointmentId, newStatus) => {
    try {
      const response = await appointmentAPI.updateStatus(appointmentId, newStatus);
      
      if (response.success) {
        toast.success(`Appointment ${newStatus} successfully`);
        await fetchDoctorAppointments();
      } else {
        toast.error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  }, [fetchDoctorAppointments]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchDoctorAppointments();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchDoctorAppointments]);

  const pendingCount = useMemo(() => appointments.filter(a => (a.status || '').toLowerCase() === 'pending').length, [appointments]);
  const countsByStatus = useMemo(() => {
    const counts = { all: appointments.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    for (const a of appointments) {
      const s = (a.status || '').toLowerCase();
      if (counts[s] !== undefined) counts[s] += 1;
    }
    return counts;
  }, [appointments]);

  // Sorting util
  const toMins = (t) => {
    if (!t) return 0;
    const [start] = String(t).split('-');
    const [h, m] = start.split(':').map(Number);
    return h * 60 + m;
  };

  // Sort by date, time, then serialNumber (ascending)
  const sortedByQueue = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const d = new Date(a.appointmentDate) - new Date(b.appointmentDate);
      if (d !== 0) return d;
      const tm = toMins(a.appointmentTime) - toMins(b.appointmentTime);
      if (tm !== 0) return tm;
      return (a.serialNumber || 0) - (b.serialNumber || 0);
    });
  }, [appointments]);

  // Build queue entries from next pending slot
  useEffect(() => {
    const pendings = sortedByQueue.filter(a => (a.status || '').toLowerCase() === 'pending');
    if (pendings.length === 0) {
      setQueueEntries([]);
      return;
    }
    const next = pendings[0];
    const sameSlot = pendings.filter(a => a.appointmentDate === next.appointmentDate && a.appointmentTime === next.appointmentTime)
      .slice(0, 4)
      .map(a => ({ name: a.patientName, serial: a.serialNumber }));
    setQueueEntries(sameSlot);
  }, [sortedByQueue]);

  const filteredAppointments = useMemo(() => {
    const base = sortedByQueue;
    if (statusFilter === 'all') return base;
    return base.filter(a => (a.status || '').toLowerCase() === statusFilter);
  }, [sortedByQueue, statusFilter]);

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="skeleton h-8 w-48"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="skeleton h-28 w-full"></div>
        <div className="skeleton h-28 w-full"></div>
        <div className="skeleton h-28 w-full"></div>
      </div>
      <div className="skeleton h-64 w-full"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="py-6">{renderLoadingSkeleton()}</div>
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
      <div role="tablist" className="tabs tabs-boxed">
        <button role="tab" className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`} onClick={() => setActiveTab('profile')}>
          🧑‍⚕️ Profile
        </button>
        <button role="tab" className={`tab ${activeTab === 'appointments' ? 'tab-active' : ''}`} onClick={() => setActiveTab('appointments')}>
          📅 Appointments {pendingCount > 0 ? <span className="badge badge-warning ml-2">{pendingCount}</span> : null}
        </button>
        <button role="tab" className={`tab ${activeTab === 'patients' ? 'tab-active' : ''}`} onClick={() => setActiveTab('patients')}>
          👥 Patient Details
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 rounded-full bg-base-300 overflow-hidden grid place-items-center text-4xl">
                {doctorProfile?.photoURL ? (
                  <img src={doctorProfile.photoURL} alt="Doctor avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>🧑‍⚕️</span>
                )}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-2xl font-bold">{doctorProfile?.name || 'Doctor'}</h3>
                  <p className="opacity-80">{doctorProfile?.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="badge badge-info">Doctor</span>
                  </div>
                </div>
                <div>
                  <p>Role: <span className="font-semibold">{doctorProfile?.role || '-'}</span></p>
                  <p>Email: <span className="font-semibold">{doctorProfile?.email || '-'}</span></p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm opacity-80">Each time slot can accommodate up to 4 patients. Patients receive serial numbers (1–4) based on booking order.</p>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 card bg-base-200 shadow">
              <div className="card-body">
                <h3 className="card-title">Current Queue</h3>
                {queueEntries.length === 0 ? (
                  <p className="opacity-70 text-sm">No pending queue for the next pending slot.</p>
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
            <div className="col-span-1 md:col-span-2"></div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatusFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="badge ml-2">{countsByStatus[s]}</span>
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Patient Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Symptoms</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center opacity-70">No appointments</td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    const id = apt._id;
                    const status = (apt.status || '').toLowerCase();
                    return (
                      <tr key={id}>
                        <td>{apt.serialNumber || '-'}</td>
                        <td>{apt.patientName}</td>
                        <td>{apt.appointmentDate}</td>
                        <td>{apt.appointmentTime}</td>
                        <td>{apt.symptoms || '-'}</td>
                        <td>
                          <span className={`badge ${status === 'confirmed' ? 'badge-success' : status === 'pending' ? 'badge-warning' : status === 'completed' ? 'badge-info' : status === 'cancelled' ? 'badge-error' : 'badge-ghost'}`}>
                            {status}
                          </span>
                        </td>
                        <td className="flex gap-2">
                          {status === 'pending' ? (
                            <>
                              <button className="btn btn-xs btn-success" onClick={() => handleUpdateAppointmentStatus(id, 'confirmed')}>Accept</button>
                              <button className="btn btn-xs btn-error" onClick={() => handleUpdateAppointmentStatus(id, 'cancelled')}>Reject</button>
                            </>
                          ) : status === 'confirmed' ? (
                            <button className="btn btn-xs btn-info" onClick={() => handleUpdateAppointmentStatus(id, 'completed')}>Complete</button>
                          ) : (
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
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 text-center opacity-70">No patients found</div>
          ) : null}
          {patients.map((p) => (
            <div key={p.email} className="card bg-base-200 shadow">
              <div className="card-body">
                <h4 className="card-title">{p.name || p.email}</h4>
                <p>Email: {p.email}</p>
                {p.phone ? <p>Phone: {p.phone}</p> : null}
                <p>Gender: {p.gender || '-'}</p>
                <p>Age: {p.age || '-'}</p>
                <p>Total Visits: {p.visits}</p>
                <p>Last Visit: {p.lastVisit || '-'}</p>
                <div className="collapse collapse-arrow bg-base-300">
                  <input type="checkbox" />
                  <div className="collapse-title text-md font-medium">View History</div>
                  <div className="collapse-content">
                    <ul className="list-disc ml-5 space-y-1">
                      {p.history.sort((a,b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)).map((h) => (
                        <li key={h._id + h.appointmentDate}>
                          {h.appointmentDate} {h.appointmentTime} — {h.symptoms || '-'} (serial {h.serialNumber || '-'}) ({(h.status || '').toLowerCase()})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;


