import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import UseAuth from "../../../Hooks/UseAuth";
import { appointmentAPI } from "../../../services/api";
import PrescriptionModal from "./PrescriptionModal";

const DoctorDashboard = () => {
  const { userData } = UseAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [patientCollection, setPatientCollection] = useState([]); // Data from patient collection
  const [statusFilter, setStatusFilter] = useState("all");
  const [queueEntries, setQueueEntries] = useState([]); // up to 4 entries for next pending slot
  const [queueDateFilter, setQueueDateFilter] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [prescriptionModal, setPrescriptionModal] = useState({
    isOpen: false,
    appointment: null,
  });
  const [patientProfileModal, setPatientProfileModal] = useState({
    isOpen: false,
    patient: null,
  });

  const buildPatientsFromAppointments = useCallback((all) => {
    const map = new Map();
    const sorted = [...all].sort(
      (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
    );
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
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastVisit) - new Date(a.lastVisit)
    );
  }, []);

  const fetchDoctorAppointments = useCallback(async () => {
    if (!userData?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await appointmentAPI.getDoctorAppointments(
        userData.email
      );

      if (response.success) {
        const allAppointments = response.data || [];
        setAppointments(allAppointments);

        setDoctorProfile({
          name: userData.displayName,
          email: userData.email,
          role: userData.role,
          photoURL: userData.photoURL || "",
        });
      } else {
        setError("Failed to load appointments");
        toast.error("Failed to load appointments");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments");
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [
    userData?.email,
    buildPatientsFromAppointments,
    userData?.displayName,
    userData?.role,
  ]);

  // Fetch pending appointment requests
  const fetchPendingRequests = useCallback(async () => {
    if (!userData?.email) return;

    setLoadingRequests(true);
    try {
      const response = await appointmentAPI.getRequests(userData.email);
      if (response.success) {
        setPendingRequests(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      toast.error("Failed to load pending requests");
    } finally {
      setLoadingRequests(false);
    }
  }, [userData?.email]);

  // Fetch patient collection data
  const fetchPatientCollection = useCallback(async () => {
    if (!userData?.email) return;

    console.log("🔍 Fetching patient collection for doctor:", userData.email);

    try {
      // Use the correct endpoint to get all patients for the doctor
      const response = await appointmentAPI.getDoctorPatients(userData.email);
      console.log("📊 Patient collection response:", response);

      if (response.success) {
        setPatientCollection(response.data || []);
        console.log("✅ Patient collection updated:", response.data);
      } else {
        console.log("❌ Patient collection failed:", response.message);
        toast.error("Failed to load patient collection");
      }
    } catch (error) {
      console.error("🚨 Error fetching patient collection:", error);
      toast.error("Failed to load patient collection");
    }
  }, [userData?.email]);

  // Approve appointment request
  const handleApproveRequest = useCallback(
    async (appointmentId) => {
      try {
        const response = await appointmentAPI.approveRequest(appointmentId);
        if (response.success) {
          toast.success(
            "Appointment request approved successfully - Patient added to queue!"
          );
          await Promise.all([
            fetchPendingRequests(),
            fetchDoctorAppointments(),
            // Note: Patient collection is NOT refreshed here - only after "Done" is pressed
          ]);
        } else {
          toast.error("Failed to approve request");
        }
      } catch (error) {
        console.error("Error approving request:", error);
        toast.error("Failed to approve request");
      }
    },
    [fetchPendingRequests, fetchDoctorAppointments]
  );

  // Reject appointment request
  const handleRejectRequest = useCallback(
    async (appointmentId) => {
      const reason =
        prompt("Please provide a reason for rejection (optional):") ||
        "No reason provided";
      try {
        const response = await appointmentAPI.rejectRequest(
          appointmentId,
          reason
        );
        if (response.success) {
          // Show a more informative toast with the rejection reason
          if (reason && reason !== "No reason provided") {
            toast.success(`Appointment request rejected. Reason: ${reason}`);
          } else {
            toast.success("Appointment request rejected");
          }
          await fetchPendingRequests();
        } else {
          toast.error("Failed to reject request");
        }
      } catch (error) {
        console.error("Error rejecting request:", error);
        toast.error("Failed to reject request");
      }
    },
    [fetchPendingRequests]
  );

  // Open prescription modal
  const handlePrescription = (appointment) => {
    console.log("💊 Opening prescription modal for appointment:", appointment);
    console.log("📊 Appointment status:", appointment.status);
    console.log("🆔 Appointment ID:", appointment._id);

    // Check if appointment status allows prescription
    if (
      !["approved", "pending", "confirmed"].includes(
        appointment.status?.toLowerCase()
      )
    ) {
      toast.error(
        `Cannot add prescription to appointment with status: ${appointment.status}`
      );
      return;
    }

    setPrescriptionModal({ isOpen: true, appointment });
  };

  // Close prescription modal
  const closePrescriptionModal = () => {
    setPrescriptionModal({ isOpen: false, appointment: null });
  };

  // Handle prescription submission
  const handlePrescriptionSubmit = async (prescriptionData) => {
    try {
      console.log(
        "💊 Submitting prescription for appointment:",
        prescriptionModal.appointment._id
      );
      console.log("📝 Prescription data:", prescriptionData);
      console.log(
        "📊 Appointment status:",
        prescriptionModal.appointment.status
      );
      console.log("🌐 API Base URL:", "digital-healthcare-assistant.vercel.app/api");
      console.log(
        "🔗 Full API URL:",
        `digital-healthcare-assistant.vercel.app/api/appointments/${prescriptionModal.appointment._id}/prescription`
      );

      // Step 1: Add prescription to appointment
      console.log("🌐 Step 1: Adding prescription to appointment...");
      console.log(
        "📡 API URL:",
        `digital-healthcare-assistant.vercel.app/api/appointments/${prescriptionModal.appointment._id}/prescription`
      );
      console.log("📤 Request payload:", prescriptionData);

      const appointmentResponse = await appointmentAPI.addPrescription(
        prescriptionModal.appointment._id,
        prescriptionData
      );

      console.log("📊 Appointment prescription response:", appointmentResponse);

      if (appointmentResponse.success) {
        console.log(
          "✅ Step 1 Complete: Prescription saved to appointment successfully"
        );

        // Step 2: Mark appointment as completed (backend will create patient record automatically)
        console.log("🔄 Step 2: Marking appointment as completed...");
        const statusResponse = await appointmentAPI.updateStatus(
          prescriptionModal.appointment._id,
          "completed"
        );

        if (statusResponse.success) {
          console.log("✅ Step 2 Complete: Appointment marked as completed");
          console.log(
            "🎯 Backend should now create patient record automatically"
          );

          toast.success(
            "Prescription saved and appointment completed! Patient data created automatically."
          );
          closePrescriptionModal();

          // Refresh both appointments and patient collection
          await Promise.all([
            fetchDoctorAppointments(),
            fetchPatientCollection(),
          ]);
        } else {
          console.error(
            "❌ Step 2 Failed: Could not mark appointment as completed:",
            statusResponse.message
          );
          toast.error("Prescription saved but failed to complete appointment");
        }
      } else {
        console.error(
          "❌ Step 1 Failed: Could not add prescription:",
          appointmentResponse.message
        );
        toast.error(
          "Failed to add prescription: " +
            (appointmentResponse.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("🚨 Error adding prescription:", error);
      console.error("🚨 Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error("Failed to add prescription: " + error.message);
    }
  };

  useEffect(() => {
    let cancelled = false;
    console.log("🚀 DoctorDashboard useEffect triggered");

    (async () => {
      console.log("📥 Starting to fetch data...");
      await Promise.all([
        fetchDoctorAppointments(),
        fetchPendingRequests(),
        fetchPatientCollection(),
      ]);
      console.log("✅ All data fetched");
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchDoctorAppointments, fetchPendingRequests, fetchPatientCollection]);

  // Handle viewing patient profile
  const handleViewPatientProfile = (patient) => {
    setPatientProfileModal({ isOpen: true, patient });
  };

  // Close patient profile modal
  const closePatientProfileModal = () => {
    setPatientProfileModal({ isOpen: false, patient: null });
  };

  const pendingCount = useMemo(
    () =>
      appointments.filter((a) => (a.status || "").toLowerCase() === "pending")
        .length,
    [appointments]
  );

  // Get available dates for queue filtering (only dates with approved appointments)
  const availableQueueDates = useMemo(() => {
    const approvedAppointments = appointments.filter((a) =>
      ["approved"].includes((a.status || "").toLowerCase())
    );
    const dates = [
      ...new Set(approvedAppointments.map((a) => a.appointmentDate)),
    ];
    console.log("📅 Available queue dates calculation:", {
      totalAppointments: appointments.length,
      approvedAppointments: approvedAppointments.length,
      approvedDates: dates,
      allAppointments: appointments.map((a) => ({
        name: a.patientName,
        date: a.appointmentDate,
        status: a.status,
        serial: a.serialNumber,
      })),
    });
    return dates.sort(); // Ascending order (earliest first)
  }, [appointments]);
  const countsByStatus = useMemo(() => {
    const counts = {
      all: appointments.length,
      approved: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const a of appointments) {
      const s = (a.status || "").toLowerCase();
      if (counts[s] !== undefined) counts[s] += 1;
    }
    return counts;
  }, [appointments]);

  // Sorting util
  const toMins = (t) => {
    if (!t) return 0;
    const [start] = String(t).split("-");
    const [h, m] = start.split(":").map(Number);
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

  // Build queue entries from selected date (approved only)
  useEffect(() => {
    console.log("🔍 Queue Date Filter:", queueDateFilter);
    console.log("📅 Available Dates:", availableQueueDates);
    console.log("📊 All appointments:", appointments);

    // Only show approved appointments in queue (completed patients are removed)
    const activeAppointments = sortedByQueue.filter(
      (a) =>
        ["approved"].includes((a.status || "").toLowerCase()) &&
        a.appointmentDate === queueDateFilter
    );

    console.log(
      "✅ Approved Appointments for date:",
      queueDateFilter,
      activeAppointments
    );
    console.log(
      "🔍 Filtered appointments by status and date:",
      sortedByQueue.filter((a) =>
        ["approved"].includes((a.status || "").toLowerCase())
      )
    );

    if (activeAppointments.length === 0) {
      setQueueEntries([]);
      return;
    }

    // Group appointments by time slot
    const timeSlots = {};
    activeAppointments.forEach((apt) => {
      const key = apt.appointmentTime;
      if (!timeSlots[key]) {
        timeSlots[key] = [];
      }
      timeSlots[key].push(apt);
    });

    console.log("⏰ Time slots found:", timeSlots);

    // Sort time slots and get the first one
    const sortedTimeSlots = Object.keys(timeSlots).sort();
    const firstTimeSlot = sortedTimeSlots[0];

    console.log("🎯 First time slot:", firstTimeSlot);

    if (!firstTimeSlot) {
      setQueueEntries([]);
      return;
    }

    // Sort by original serialNumber to maintain booking order.
    // Preserve original serial/time; only the highlighting (Current/Next) is based on current position in the displayed queue.
    const sameSlot = timeSlots[firstTimeSlot]
      .sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0))
      .slice(0, 4)
      .map((a, index) => {
        const serialNumber = a.serialNumber || 1; // preserve original serial from DB
        const estimatedTime = calculateEstimatedTime(
          a.appointmentTime,
          serialNumber
        ); // time based on original serial

        return {
          name: a.patientName,
          serial: serialNumber, // display original serial
          status: a.status,
          email: a.patientEmail,
          appointmentDate: a.appointmentDate,
          appointmentTime: a.appointmentTime,
          estimatedTime,
          isCurrent: index === 0,
          isNext: index === 1,
          displayTime:
            index === 0
              ? `Current: ${estimatedTime}`
              : `Estimated: ${estimatedTime}`,
          queueStatus: index === 1 ? "Next: Please be ready!" : "Waiting",
        };
      });

    console.log(
      "🔄 Queue entries (preserving original serial/time):",
      sameSlot
    );
    setQueueEntries(sameSlot);
  }, [sortedByQueue, queueDateFilter]);

  // Set initial queue date filter to earliest date with approved appointments
  useEffect(() => {
    if (availableQueueDates.length > 0 && !queueDateFilter) {
      // Select the earliest date (first in sorted array)
      setQueueDateFilter(availableQueueDates[0]);
      console.log(
        "🎯 Setting initial queue date to earliest:",
        availableQueueDates[0]
      );
    }
  }, [availableQueueDates, queueDateFilter]);

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

  // Calculate current queue position for an appointment
  const getCurrentQueuePosition = (appointment) => {
    // Only calculate for approved appointments
    if (appointment.status !== "approved") {
      return appointment.serialNumber || "-";
    }

    // Get all approved appointments for the same date and time slot
    const sameSlotAppointments = appointments.filter(
      (a) =>
        a.status === "approved" &&
        a.appointmentDate === appointment.appointmentDate &&
        a.appointmentTime === appointment.appointmentTime
    );

    // Sort by original booking order
    const sortedAppointments = sameSlotAppointments.sort(
      (a, b) => (a.serialNumber || 0) - (b.serialNumber || 0)
    );

    // Find the current position (index + 1)
    const currentPosition =
      sortedAppointments.findIndex((a) => a._id === appointment._id) + 1;

    return currentPosition > 0
      ? currentPosition
      : appointment.serialNumber || "-";
  };

  const filteredAppointments = useMemo(() => {
    const base = sortedByQueue;
    if (statusFilter === "all") {
      // Show all appointments except pending_request (those are handled in Requests tab)
      return base.filter(
        (a) => (a.status || "").toLowerCase() !== "pending_request"
      );
    }
    return base.filter((a) => (a.status || "").toLowerCase() === statusFilter);
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
    return <div className="py-6">{renderLoadingSkeleton()}</div>;
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
      <Helmet>
        <meta charSet="utf-8" />
        <title>{"Doctors Dashbord"} | Digital Healthcare</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <div role="tablist" className="tabs tabs-boxed">
        <button
          role="tab"
          className={`tab ${activeTab === "profile" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          🧑‍⚕️ Profile
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          📋 Requests{" "}
          {pendingRequests.length > 0 ? (
            <span className="badge badge-warning ml-2">
              {pendingRequests.length}
            </span>
          ) : null}
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === "appointments" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          📅 Appointments{" "}
          {pendingCount > 0 ? (
            <span className="badge badge-warning ml-2">{pendingCount}</span>
          ) : null}
        </button>

        <button
          role="tab"
          className={`tab ${
            activeTab === "patientRecords" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("patientRecords")}
        >
          📋 Patient Records
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 rounded-full bg-base-300 overflow-hidden grid place-items-center text-4xl">
                {doctorProfile?.photoURL ? (
                  <img
                    src={doctorProfile.photoURL}
                    alt="Doctor avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>🧑‍⚕️</span>
                )}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-2xl font-bold">
                    {doctorProfile?.name || "Doctor"}
                  </h3>
                  <p className="opacity-80">{doctorProfile?.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="badge badge-info">Doctor</span>
                  </div>
                </div>
                <div>
                  <p>
                    Role:{" "}
                    <span className="font-semibold">
                      {doctorProfile?.role || "-"}
                    </span>
                  </p>
                  <p>
                    Email:{" "}
                    <span className="font-semibold">
                      {doctorProfile?.email || "-"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "requests" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Pending Appointment Requests</h2>
          {loadingRequests ? (
            <div className="space-y-4">
              <div className="skeleton h-32 w-full"></div>
              <div className="skeleton h-32 w-full"></div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="alert alert-info">
              <span>No pending appointment requests</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((request) => (
                <div key={request._id} className="card bg-base-200 shadow">
                  <div className="card-body">
                    <h3 className="card-title">{request.patientName}</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {request.patientEmail}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {request.patientPhone}
                      </p>
                      <p>
                        <span className="font-semibold">Date:</span>{" "}
                        {request.appointmentDate}
                      </p>
                      <p>
                        <span className="font-semibold">Time:</span>{" "}
                        {request.appointmentTime}
                      </p>
                      <p>
                        <span className="font-semibold">Age:</span>{" "}
                        {request.patientAge}
                      </p>
                      <p>
                        <span className="font-semibold">Gender:</span>{" "}
                        {request.patientGender}
                      </p>
                      <p>
                        <span className="font-semibold">Symptoms:</span>{" "}
                        {request.symptoms || "Not specified"}
                      </p>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApproveRequest(request._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleRejectRequest(request._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="col-span-1 lg:col-span-2 card bg-base-200 shadow">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="card-title">Current Queue</h3>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Date:</label>
                    <select
                      value={queueDateFilter}
                      onChange={(e) => {
                        console.log("🎯 Date selected:", e.target.value);
                        setQueueDateFilter(e.target.value);
                      }}
                      className="select select-sm select-bordered"
                    >
                      {availableQueueDates.length > 0 ? (
                        availableQueueDates.map((date) => (
                          <option key={date} value={date}>
                            {new Date(date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            (
                            {
                              appointments.filter(
                                (a) =>
                                  a.appointmentDate === date &&
                                  a.status === "approved"
                              ).length
                            }{" "}
                            approved)
                          </option>
                        ))
                      ) : (
                        <option value="">No approved appointments</option>
                      )}
                    </select>
                  </div>
                </div>
                {queueEntries.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="opacity-70 text-sm mb-2">
                      No approved appointments for {queueDateFilter}.
                    </p>
                    <p className="text-xs opacity-50">
                      Only approved patients appear in queue.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-base-100 p-3 rounded-lg border">
                      <p className="text-sm font-medium mb-1">
                        📅 Date: {queueEntries[0]?.appointmentDate}
                      </p>
                      <p className="text-sm opacity-70">
                        ⏰ Time Slot: {queueEntries[0]?.appointmentTime}
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {queueEntries.map((q) => (
                        <li
                          key={q.serial}
                          className={`p-3 rounded-lg ${
                            q.isCurrent
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-base-100 border"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="badge badge-primary text-sm">
                                {q.serial}
                              </span>
                              <span className="font-medium">{q.name}</span>
                            </div>
                            <span
                              className={`badge badge-xs ${
                                q.status === "approved"
                                  ? "badge-info"
                                  : q.status === "completed"
                                  ? "badge-success"
                                  : q.status === "cancelled"
                                  ? "badge-error"
                                  : "badge-warning"
                              }`}
                            >
                              {q.status}
                            </span>
                          </div>
                          <div className="ml-8 text-sm">
                            <span
                              className={`font-medium ${
                                q.isCurrent ? "text-primary" : "text-gray-600"
                              }`}
                            >
                              {q.displayTime}
                            </span>
                          </div>
                          {q.isNext && (
                            <div className="ml-8 mt-1">
                              <span className="badge badge-warning badge-xs">
                                {q.queueStatus}
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
            <div className="col-span-1 lg:col-span-2"></div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["all", "approved", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${
                  statusFilter === s ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "approved"
                  ? "Approved"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
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
                    <td colSpan={7} className="text-center opacity-70">
                      No appointments
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => {
                    const id = apt._id;
                    const status = (apt.status || "").toLowerCase();
                    const currentQueuePosition = getCurrentQueuePosition(apt);
                    return (
                      <tr key={id}>
                        {/* Serial: show original serial for all rows. If needed, fall back to '-' */}
                        <td>{apt.serialNumber || "-"}</td>
                        <td>{apt.patientName}</td>
                        <td>{apt.appointmentDate}</td>
                        <td>
                          {apt.status === "approved"
                            ? calculateEstimatedTime(
                                apt.appointmentTime,
                                apt.serialNumber || 1
                              )
                            : apt.appointmentTime}
                        </td>
                        <td>{apt.symptoms || "-"}</td>
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
                        </td>
                        <td className="flex gap-2">
                          {status === "pending_request" ? (
                            <span className="text-sm opacity-70">
                              Waiting for approval in Requests tab
                            </span>
                          ) : status === "approved" ? (
                            <>
                              <button
                                className="btn btn-xs btn-primary"
                                onClick={() => handlePrescription(apt)}
                              >
                                Prescription
                              </button>
                            </>
                          ) : status === "completed" ? (
                            <span className="text-sm opacity-70">
                              Treatment completed
                            </span>
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

      {activeTab === "patientRecords" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Patient Records</h2>
            <div className="text-sm opacity-70">
              {patientCollection.length} patients with records
            </div>
          </div>

          {patientCollection.length === 0 ? (
            <div className="alert alert-info">
              <span>
                No patient records found. Patients will appear here after you
                approve their appointments and add prescriptions.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientCollection.map((patient) => (
                <div key={patient.email} className="card bg-base-200 shadow">
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-bold overflow-hidden">
                        {patient.photoURL ? (
                          <img
                            src={patient.photoURL}
                            alt={patient.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>
                            {patient.name
                              ? patient.name.charAt(0).toUpperCase()
                              : "P"}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="card-title text-lg">
                          {patient.name || patient.email}
                        </h4>
                        <p className="text-sm opacity-70">{patient.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {patient.phone && (
                        <p>
                          <span className="font-semibold">Phone:</span>{" "}
                          {patient.phone}
                        </p>
                      )}
                      {patient.gender && (
                        <p>
                          <span className="font-semibold">Gender:</span>{" "}
                          {patient.gender}
                        </p>
                      )}
                      {patient.age && (
                        <p>
                          <span className="font-semibold">Age:</span>{" "}
                          {patient.age}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Total Visits:</span>{" "}
                        {patient.visits || 1}
                      </p>
                      <p>
                        <span className="font-semibold">Last Visit:</span>{" "}
                        {patient.lastVisit || "Recent"}
                      </p>
                    </div>

                    {/* Prescriptions Summary */}
                    {patient.prescriptions &&
                      patient.prescriptions.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-semibold mb-2 text-primary">
                            Prescriptions ({patient.prescriptions.length})
                          </h5>
                          <div className="text-xs opacity-80">
                            Latest:{" "}
                            {
                              patient.prescriptions[
                                patient.prescriptions.length - 1
                              ]?.diagnosis
                            }
                          </div>
                        </div>
                      )}

                    <div className="card-actions justify-end mt-3">
                      <button
                        className="btn btn-xs btn-outline btn-primary"
                        onClick={() => handleViewPatientProfile(patient)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Prescription Modal */}
      <PrescriptionModal
        appointment={prescriptionModal.appointment}
        isOpen={prescriptionModal.isOpen}
        onClose={closePrescriptionModal}
        onSubmit={handlePrescriptionSubmit}
      />

      {/* Patient Profile Modal */}
      {patientProfileModal.isOpen && patientProfileModal.patient && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">
              {patientProfileModal.patient.name}&apos;s Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-md">Patient Information</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {patientProfileModal.patient.email}
                  </p>
                  {patientProfileModal.patient.phone && (
                    <p>
                      <span className="font-semibold">Phone:</span>{" "}
                      {patientProfileModal.patient.phone}
                    </p>
                  )}
                  {patientProfileModal.patient.age && (
                    <p>
                      <span className="font-semibold">Age:</span>{" "}
                      {patientProfileModal.patient.age}
                    </p>
                  )}
                  {patientProfileModal.patient.gender && (
                    <p>
                      <span className="font-semibold">Gender:</span>{" "}
                      {patientProfileModal.patient.gender}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">Total Visits:</span>{" "}
                    {patientProfileModal.patient.visits || 1}
                  </p>
                  <p>
                    <span className="font-semibold">Last Visit:</span>{" "}
                    {patientProfileModal.patient.lastVisit || "Recent"}
                  </p>
                  <p>
                    <span className="font-semibold">Member Since:</span>{" "}
                    {patientProfileModal.patient.createdAt
                      ? new Date(
                          patientProfileModal.patient.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Prescriptions Summary */}
              <div className="space-y-4">
                <h4 className="font-semibold text-md">
                  Prescription History (
                  {patientProfileModal.patient.prescriptions?.length || 0})
                </h4>
                {patientProfileModal.patient.prescriptions &&
                patientProfileModal.patient.prescriptions.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {patientProfileModal.patient.prescriptions.map(
                      (prescription, index) => (
                        <div
                          key={index}
                          className="p-3 bg-base-100 rounded border"
                        >
                          <div className="text-xs opacity-70 mb-1">
                            {prescription.appointmentDate} at{" "}
                            {prescription.appointmentTime}
                          </div>
                          <p className="font-medium text-sm">
                            {prescription.diagnosis}
                          </p>
                          <p className="text-xs opacity-80">
                            {prescription.medications}
                          </p>
                          {prescription.dosage && (
                            <p className="text-xs opacity-70">
                              Dosage: {prescription.dosage}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm opacity-70">No prescriptions yet</p>
                )}
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={closePatientProfileModal}
              >
                Close
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={closePatientProfileModal}
          ></div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
