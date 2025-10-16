import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import UseAuth from "../../../Hooks/UseAuth";
import { appointmentAPI, doctorAPI } from "../../../services/api";
import PrescriptionViewModal from "./PrescriptionViewModal";
import RescheduleModal from "./RescheduleModal";
import { Helmet } from "react-helmet";

export default function PatientDashboard() {
  const { userData } = UseAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({}); // Store doctor details by email
  const [error, setError] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState({
    isOpen: false,
    appointment: null,
  });
  const [queueEntries, setQueueEntries] = useState([]); // up to 4 entries
  const [prescriptionModal, setPrescriptionModal] = useState({
    isOpen: false,
    appointment: null,
  });

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await doctorAPI.getAll();
      if (response.success && response.data) {
        const doctorsMap = {};
        response.data.forEach((doctor) => {
          doctorsMap[doctor.email] = doctor;
        });
        setDoctors(doctorsMap);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
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
      const response = await appointmentAPI.getPatientAppointments(
        userData.uid
      );

      if (response.success) {
        setAppointments(response.data || []);
      } else {
        setError("Failed to load appointments");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [userData?.uid]);

  // Build queue for the patient's next active appointment
  const buildMyQueue = useCallback(
    async (sortedApps) => {
      try {
        const myNext = sortedApps.find((a) =>
          ["pending", "confirmed", "approved"].includes(
            (a.status || "").toLowerCase()
          )
        );
        if (!myNext) {
          setQueueEntries([]);
          return;
        }
        const doctorEmail = myNext.doctorEmail;
        const response = await appointmentAPI.getDoctorAppointments(
          doctorEmail
        );
        if (!response.success) {
          setQueueEntries([]);
          return;
        }
        const all = response.data || [];
        const sameSlot = all
          .filter(
            (a) =>
              ["pending", "confirmed", "approved"].includes(
                (a.status || "").toLowerCase()
              ) &&
              a.appointmentDate === myNext.appointmentDate &&
              a.appointmentTime === myNext.appointmentTime
          )
          .sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0))
          .slice(0, 4)
          .map((a) => {
            const serialNumber = a.serialNumber || 1;
            const estimatedTime = calculateEstimatedTime(
              myNext.appointmentTime,
              serialNumber
            );
            return {
              name: a.patientName,
              serial: serialNumber, // Use actual serialNumber from database
              status: a.status,
              isMe: a.patientEmail === userData?.email,
              estimatedTime: estimatedTime,
            };
          });
        setQueueEntries(sameSlot);
      } catch (e) {
        console.debug("Unable to build queue", e);
        setQueueEntries([]);
      }
    },
    [userData?.email]
  );
  

  // Calculate estimated time for each patient (15 minutes per patient)
  const calculateEstimatedTime = (slotTime, serialNumber) => {
    if (!slotTime || !serialNumber) return "";

    const [startTime] = slotTime.split("-");
    const [hour, minute] = startTime.split(":").map(Number);

    // Create a date object for proper time calculation
    const startTimeDate = new Date();
    startTimeDate.setHours(hour, minute, 0, 0);

    // Each patient gets 15 minutes, calculate based on serial number
    const patientTime = new Date(
      startTimeDate.getTime() + (serialNumber - 1) * 15 * 60 * 1000
    );

    return patientTime.toTimeString().slice(0, 5);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (
      !confirm(
        "Are you sure you want to cancel this appointment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await appointmentAPI.cancel(appointmentId);

      if (response.success) {
        toast.success("Appointment cancelled successfully!");
        await fetchPatientAppointments();
        // Queue will automatically refresh due to useEffect dependency
      } else {
        toast.error("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment. Please try again.");
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

  const handleViewPrescription = (appointment) => {
    setPrescriptionModal({ isOpen: true, appointment });
  };

  const closePrescriptionModal = () => {
    setPrescriptionModal({ isOpen: false, appointment: null });
  };

  const handlePayment = () => {
    console.log("Payment button clicked!"); // Debug log
    toast.success("Payment completed");
  };

  const getDoctorName = (doctorEmail) => {
    if (!doctorEmail) return "N/A";
    const doctor = doctors[doctorEmail];
    return doctor
      ? doctor.name || doctor.displayName || "Dr. " + doctorEmail.split("@")[0]
      : "Dr. " + doctorEmail.split("@")[0];
  };

  const getDoctorSpecialization = (doctorEmail) => {
    if (!doctorEmail) return "N/A";
    const doctor = doctors[doctorEmail];
    return doctor
      ? doctor.specialization || doctor.department || "General Medicine"
      : "General Medicine";
  };

  const upcomingAppointments = appointments.filter(
    (apt) =>
      (apt.status === "confirmed" || apt.status === "approved") &&
      new Date(apt.appointmentDate) > new Date()
  );

  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending" || apt.status === "pending_request"
  );

  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  );

  // Sort appointments by date, time, then serialNumber
  const toMins = (t) => {
    if (!t) return 0;
    const [start] = String(t).split("-");
    const [h, m] = start.split(":").map(Number);
    return h * 60 + m;
  };
  const sortedAppointments = [...appointments].sort((a, b) => {
    const d = new Date(a.appointmentDate) - new Date(b.appointmentDate);
    if (d !== 0) return d;
    const tm = toMins(a.appointmentTime) - toMins(b.appointmentTime);
    if (tm !== 0) return tm;
    return (a.serialNumber || 0) - (b.serialNumber || 0);
  });

  useEffect(() => {
    fetchDoctors();
    fetchPatientAppointments();
  }, [fetchDoctors, fetchPatientAppointments]);

  // Refresh queue whenever appointments change
  useEffect(() => {
    if (appointments.length > 0) {
      buildMyQueue(sortedAppointments);
    }
  }, [appointments, buildMyQueue, sortedAppointments]);

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

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userData?.displayName || userData?.firstName || "User"
  )}&background=0D8ABC&color=fff&size=128`;

  return (
    <div className="space-y-6">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{"Patient Dashbord"} | Digital Healthcare</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-200 shadow md:col-span-2">
          <div className="card-body">
            <h3 className="card-title mb-2">My Profile</h3>
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-base-300 border-4 border-white shadow">
                {userData?.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <img
                    src={avatarFallback}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {userData?.displayName || userData?.firstName || "N/A"}
                </p>
                <p className="whitespace-nowrap">
                  <span className="font-semibold">Email:</span>{" "}
                  {userData?.email || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Role:</span>{" "}
                  {userData?.role || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Member Since:</span>{" "}
                  {userData?.createdAt
                    ? new Date(userData.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
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

        {/* Queue card */}
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h3 className="card-title">Current Queue</h3>
            {queueEntries.length === 0 ? (
              <p className="opacity-70 text-sm">
                No active queue for your next appointment.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm opacity-70 mb-2">
                  Your next appointment: {queueEntries[0]?.appointmentDate} at{" "}
                  {queueEntries[0]?.appointmentTime}
                </p>
                <ul className="space-y-2">
                  {queueEntries.map((q) => (
                    <li
                      key={q.serial}
                      className={`p-2 rounded ${
                        q.isMe ? "bg-primary/10 border border-primary/20" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <span
                            className={`badge ${
                              q.isMe ? "badge-primary" : "badge-ghost"
                            }`}
                          >
                            {q.serial}
                          </span>
                          <span
                            className={`font-medium ${
                              q.isMe ? "text-primary" : ""
                            }`}
                          >
                            {q.isMe ? "You" : q.name}
                          </span>
                        </div>
                        <span
                          className={`badge badge-xs ${
                            q.status === "confirmed"
                              ? "badge-success"
                              : q.status === "approved"
                              ? "badge-info"
                              : "badge-warning"
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <div className="ml-8 text-sm">
                        <span
                          className={`font-medium ${
                            q.serial === 1 ? "text-primary" : "text-gray-600"
                          }`}
                        >
                          {q.serial === 1
                            ? `🕐 Current: ${q.estimatedTime}`
                            : `⏰ Estimated: ${q.estimatedTime}`}
                        </span>
                      </div>
                      {q.serial === 2 && (
                        <div className="ml-8 mt-1">
                          <span className="badge badge-warning badge-xs">
                            Next: Please be ready!
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
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
                  <td colSpan={7} className="text-center opacity-70">
                    No appointments found
                  </td>
                </tr>
              ) : (
                sortedAppointments.map((appt) => {
                  const status = (appt.status || "").toLowerCase();
                  const doctorName = getDoctorName(appt.doctorEmail);
                  const doctorSpecialization = getDoctorSpecialization(
                    appt.doctorEmail
                  );

                  return (
                    <tr key={appt._id}>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold">{doctorName}</span>
                          <span className="text-xs opacity-70">
                            {appt.doctorEmail}
                          </span>
                        </div>
                      </td>
                      <td>{doctorSpecialization}</td>
                      <td>{appt.appointmentDate}</td>
                      <td>{appt.appointmentTime}</td>
                      <td>{appt.symptoms || "-"}</td>
                      <td>
                        <span
                          className={`badge ${
                            status === "confirmed"
                              ? "badge-success"
                              : status === "approved"
                              ? "badge-success"
                              : status === "pending"
                              ? "badge-warning"
                              : status === "pending_request"
                              ? "badge-warning"
                              : status === "completed"
                              ? "badge-info"
                              : status === "cancelled"
                              ? "badge-error"
                              : status === "rejected"
                              ? "badge-error"
                              : "badge-ghost"
                          }`}
                        >
                          {status === "pending_request"
                            ? "Pending Request"
                            : status}
                        </span>
                        <span className="ml-2 text-sm opacity-80">
                          Serial:{" "}
                          <span className="badge">
                            {appt.serialNumber || "-"}
                          </span>
                        </span>
                      </td>
                      <td className="text-right">
                        {status === "pending_request" && (
                          <div className="flex gap-1">
                            <span className="text-sm opacity-70">
                              Waiting for doctor approval
                            </span>
                          </div>
                        )}
                        {status === "pending" && (
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
                        {(status === "confirmed" || status === "approved") && (
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
                        {status === "completed" && (
                          <div className="flex gap-1">
                            <button
                              className="btn btn-xs btn-outline btn-success"
                              onClick={handlePayment}
                            >
                              Payment
                            </button>
                            <button
                              className="btn btn-xs btn-outline btn-info"
                              onClick={() => handleViewPrescription(appt)}
                            >
                              View Prescription
                            </button>
                          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(doctors)
              .filter((doctor) =>
                appointments.some((appt) => appt.doctorEmail === doctor.email)
              )
              .map((doctor) => {
                const doctorAppointments = appointments.filter(
                  (appt) => appt.doctorEmail === doctor.email
                );
                const completedCount = doctorAppointments.filter(
                  (appt) => appt.status === "completed"
                ).length;
                const upcomingCount = doctorAppointments.filter(
                  (appt) =>
                    appt.status === "confirmed" &&
                    new Date(appt.appointmentDate) > new Date()
                ).length;

                return (
                  <div key={doctor.email} className="card bg-base-200 shadow">
                    <div className="card-body">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-bold overflow-hidden">
                          {doctor.photoURL ? (
                            <img
                              src={doctor.photoURL}
                              alt={doctor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {doctor.name
                                ? doctor.name.charAt(0).toUpperCase()
                                : "D"}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="card-title text-lg">
                            {doctor.name || "Dr. " + doctor.email.split("@")[0]}
                          </h4>
                          <p className="text-sm opacity-70">
                            {doctor.specialization ||
                              doctor.department ||
                              "General Medicine"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm">
                        {doctor.bio || "Experienced healthcare professional"}
                      </p>
                      <div className="stats stats-horizontal mt-3">
                        <div className="stat">
                          <div className="stat-title text-xs">Completed</div>
                          <div className="stat-value text-sm">
                            {completedCount}
                          </div>
                        </div>
                        <div className="stat">
                          <div className="stat-title text-xs">Upcoming</div>
                          <div className="stat-value text-sm">
                            {upcomingCount}
                          </div>
                        </div>
                      </div>
                      <div className="card-actions justify-end mt-3">
                        <button className="btn btn-xs btn-outline">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Prescriptions Section */}
      {appointments.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">My Prescriptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments
              .filter(
                (appt) => appt.status === "completed" && appt.prescription
              )
              .map((appt, index) => (
                <div key={index} className="card bg-base-200 shadow">
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-bold">
                        💊
                      </div>
                      <div>
                        <h4 className="card-title text-lg">
                          Prescription #{index + 1}
                        </h4>
                        <p className="text-sm opacity-70">
                          {appt.appointmentDate} at {appt.appointmentTime}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">Diagnosis:</span>{" "}
                        {appt.prescription.diagnosis}
                      </p>
                      <p>
                        <span className="font-semibold">Medications:</span>{" "}
                        {appt.prescription.medications}
                      </p>
                      {appt.prescription.dosage && (
                        <p>
                          <span className="font-semibold">Dosage:</span>{" "}
                          {appt.prescription.dosage}
                        </p>
                      )}
                      {appt.prescription.instructions && (
                        <p>
                          <span className="font-semibold">Instructions:</span>{" "}
                          {appt.prescription.instructions}
                        </p>
                      )}
                      {appt.prescription.followUp && (
                        <p>
                          <span className="font-semibold">Follow-up:</span>{" "}
                          {appt.prescription.followUp}
                        </p>
                      )}
                      {appt.prescription.notes && (
                        <p>
                          <span className="font-semibold">Notes:</span>{" "}
                          {appt.prescription.notes}
                        </p>
                      )}
                    </div>

                    <div className="card-actions justify-end mt-3">
                      <button
                        className="btn btn-xs btn-outline btn-primary"
                        onClick={() => handleViewPrescription(appt)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

      {/* Prescription View Modal */}
      <PrescriptionViewModal
        appointment={prescriptionModal.appointment}
        isOpen={prescriptionModal.isOpen}
        onClose={closePrescriptionModal}
      />

      {/* Toast Notifications */}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
