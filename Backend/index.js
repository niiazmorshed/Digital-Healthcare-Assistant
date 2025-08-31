const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tv3gchv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Healthcare API Running Successfully!");
});

// Simple endpoint to get all doctors (alternative to /api/doctors)
app.get("/doctors", async (req, res) => {
  try {
    const database = client.db("HealthcareDB");
    const doctorsCollection = database.collection("doctors");
    
    const doctors = await doctorsCollection.find({}).toArray();
    
    res.status(200).json({
      success: true,
      message: "Doctors data retrieved successfully",
      data: doctors
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors data",
      error: error.message
    });
  }
});

// API endpoint to get all doctors
app.get("/api/doctors", async (req, res) => {
  try {
    const database = client.db("HealthcareDB"); // Replace with your actual database name
    const doctorsCollection = database.collection("doctors");
    
    const doctors = await doctorsCollection.find({}).toArray();
    
    res.status(200).json({
      success: true,
      message: "Doctors data retrieved successfully",
      data: doctors
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors data",
      error: error.message
    });
  }
});

// API endpoint to get doctor by ID
app.get("/api/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const database = client.db("HealthcareDB"); // Replace with your actual database name
    const doctorsCollection = database.collection("doctors");
    
    const doctor = await doctorsCollection.findOne({ _id: id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Doctor data retrieved successfully",
      data: doctor
    });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor data",
      error: error.message
    });
  }
});

// API endpoint to get doctors by specialization
app.get("/api/doctors/specialization/:specialization", async (req, res) => {
  try {
    const { specialization } = req.params;
    const database = client.db("HealthcareDB"); // Replace with your actual database name
    const doctorsCollection = database.collection("doctors");
    
    const doctors = await doctorsCollection.find({ 
      specialization: { $regex: specialization, $options: 'i' } 
    }).toArray();
    
    res.status(200).json({
      success: true,
      message: `Doctors with specialization '${specialization}' retrieved successfully`,
      data: doctors
    });
  } catch (error) {
    console.error("Error fetching doctors by specialization:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors by specialization",
      error: error.message
    });
  }
});

// User Registration API endpoint
app.post("/api/users/register", async (req, res) => {
  try {
    const { uid, email, role, displayName, photoURL } = req.body;
    
    // Validate required fields
    if (!uid || !email || !displayName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: uid, email, displayName"
      });
    }
    
    // List of doctor emails
    const doctorEmails = [
      'fahim@healthcare.com',
      'sakib@healthcare.com', 
      'samia@healthcare.com',
      'labib@healthcare.com'
    ];
    
    // Automatically determine role based on email
    let userRole = 'patient'; // default role
    if (doctorEmails.includes(email.toLowerCase())) {
      userRole = 'doctor';
    }
    
    // If role is provided in request, validate it
    if (role) {
      if (!['patient', 'doctor'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be either 'patient' or 'doctor'"
        });
      }
      // Only allow doctor role if email matches doctor emails
      if (role === 'doctor' && !doctorEmails.includes(email.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Only authorized doctors can register with doctor role"
        });
      }
      userRole = role;
    }
    
    const database = client.db("HealthcareDB");
    const usersCollection = database.collection("users");
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ uid });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this UID"
      });
    }
    
    // Create new user document
    const newUser = {
      uid,
      email,
      role: userRole,
      displayName,
      createdAt: new Date()
    };
    if (photoURL) {
      newUser.photoURL = photoURL;
    }
    
    const result = await usersCollection.insertOne(newUser);
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: result.insertedId,
        ...newUser
      }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message
    });
  }
});

// User Login API endpoint
app.post("/api/users/login", async (req, res) => {
  try {
    const { uid, email, photoURL } = req.body;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "UID is required"
      });
    }
    
    const database = client.db("HealthcareDB");
    const usersCollection = database.collection("users");
    
    // Find user by UID
    let user = await usersCollection.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first."
      });
    }
    
    // If email is provided and user exists, check if role needs to be updated
    if (email) {
      const doctorEmails = [
        'fahim@healthcare.com',
        'sakib@healthcare.com', 
        'samia@healthcare.com',
        'labib@healthcare.com'
      ];
      
      // If user's email matches doctor emails but role is not doctor, update it
      if (doctorEmails.includes(email.toLowerCase()) && user.role !== 'doctor') {
        await usersCollection.updateOne(
          { uid },
          { $set: { role: 'doctor' } }
        );
        user = await usersCollection.findOne({ uid });
      }
    }

    // If a google photoURL is provided and user has none or different, upsert it
    if (photoURL && (!user.photoURL || user.photoURL !== photoURL)) {
      await usersCollection.updateOne(
        { uid },
        { $set: { photoURL } }
      );
      user = await usersCollection.findOne({ uid });
    }
    
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: user
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to log in user",
      error: error.message
    });
  }
});

// Get user by UID API endpoint
app.get("/api/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    
    const database = client.db("HealthcareDB");
    const usersCollection = database.collection("users");
    
    const user = await usersCollection.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      data: user
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
      error: error.message
    });
  }
});

// Update user profile API endpoint
app.put("/api/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { displayName, role } = req.body;
    
    const database = client.db("HealthcareDB");
    const usersCollection = database.collection("users");
    
    // Check if user exists
    const existingUser = await usersCollection.findOne({ uid });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Prepare update object
    const updateData = {};
    if (displayName) updateData.displayName = displayName;
    if (role) {
      if (!['patient', 'doctor'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be either 'patient' or 'doctor'"
        });
      }
      updateData.role = role;
    }
    
    const result = await usersCollection.updateOne(
      { uid },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Get updated user data
    const updatedUser = await usersCollection.findOne({ uid });
    
    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user profile",
      error: error.message
    });
  }
});

// Book Appointment API endpoint
app.post("/api/appointments", async (req, res) => {
  try {
    const { 
      patientId, 
      doctorEmail, 
      patientName, 
      patientEmail, 
      patientPhone, 
      patientAge, 
      patientGender, 
      appointmentDate, 
      appointmentTime, 
      symptoms 
    } = req.body;
    
    // Validate required fields
    if (!patientId || !doctorEmail || !patientName || !patientEmail || 
        !patientPhone || !patientAge || !patientGender || !appointmentDate || 
        !appointmentTime || !symptoms) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }
    
    // Validate doctor email
    const doctorEmails = [
      'fahim@healthcare.com',
      'sakib@healthcare.com', 
      'samia@healthcare.com',
      'labib@healthcare.com'
    ];
    
    if (!doctorEmails.includes(doctorEmail.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor email"
      });
    }
    
    const database = client.db("HealthcareDB");
    const appointmentsCollection = database.collection("appointments");
    const usersCollection = database.collection("users");
    
    // Verify patient exists and has patient role
    const patient = await usersCollection.findOne({ uid: patientId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }
    
    if (patient.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: "Only patients can book appointments"
      });
    }
    
    // Check if appointment request already exists for this patient and doctor
    const existingRequest = await appointmentsCollection.findOne({
      patientId,
      doctorEmail: doctorEmail.toLowerCase(),
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending_request', 'pending', 'confirmed'] }
    });
    
    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending or active appointment with this doctor for this time slot"
      });
    }
    
    // Create appointment request (not yet in queue)
    const newAppointmentRequest = {
      patientId,
      doctorEmail: doctorEmail.toLowerCase(),
      patientName,
      patientEmail,
      patientPhone,
      patientAge,
      patientGender,
      appointmentDate,
      appointmentTime,
      symptoms,
      status: 'pending_request', // pending_request, approved, pending, confirmed, completed, cancelled
      createdAt: new Date(),
      requestType: 'appointment_request'
    };
    
    const result = await appointmentsCollection.insertOne(newAppointmentRequest);
    
    res.status(201).json({
      success: true,
      message: "Appointment request sent successfully. Waiting for doctor approval.",
      data: {
        _id: result.insertedId,
        ...newAppointmentRequest
      }
    });
  } catch (error) {
    console.error("Error sending appointment request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send appointment request",
      error: error.message
    });
  }
});

// Doctor approves appointment request and adds to queue
app.put("/api/appointments/:appointmentId/approve", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const database = client.db("HealthcareDB");
    const appointmentsCollection = database.collection("appointments");
    
    // Get the appointment request
    const appointmentRequest = await appointmentsCollection.findOne({ 
      _id: new ObjectId(appointmentId),
      status: 'pending_request'
    });
    
    if (!appointmentRequest) {
      return res.status(404).json({
        success: false,
        message: "Appointment request not found or already processed"
      });
    }
    
    // Check queue capacity for this time slot
    const activeStatuses = ['approved', 'pending', 'confirmed'];
    const currentCount = await appointmentsCollection.countDocuments({
      doctorEmail: appointmentRequest.doctorEmail,
      appointmentDate: appointmentRequest.appointmentDate,
      appointmentTime: appointmentRequest.appointmentTime,
      status: { $in: activeStatuses }
    });
    
    if (currentCount >= 4) {
      return res.status(409).json({
        success: false,
        message: "Queue is full for this time slot. Cannot approve more appointments."
      });
    }
    
    // Approve and add to queue with serial number
    const serialNumber = currentCount + 1;
    
    await appointmentsCollection.updateOne(
      { _id: new ObjectId(appointmentId) },
      { 
        $set: { 
          status: 'approved',
          serialNumber,
          approvedAt: new Date(),
          approvedBy: appointmentRequest.doctorEmail
        } 
      }
    );
    
    // IMPORTANT: DO NOT create patient record here
    // Patient record will be created when status is set to 'completed'
    
    const updatedAppointment = await appointmentsCollection.findOne({ 
      _id: new ObjectId(appointmentId) 
    });
    
    res.status(200).json({
      success: true,
      message: "Appointment approved successfully and added to queue",
      data: updatedAppointment
    });
  } catch (error) {
    console.error("Error approving appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve appointment",
      error: error.message
    });
  }
});

// Doctor rejects appointment request
app.put("/api/appointments/:appointmentId/reject", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rejectionReason } = req.body;
    
    const database = client.db("HealthcareDB");
    const appointmentsCollection = database.collection("appointments");
    
    const result = await appointmentsCollection.updateOne(
      { 
        _id: new ObjectId(appointmentId),
        status: 'pending_request'
      },
      { 
        $set: { 
          status: 'rejected',
          rejectionReason: rejectionReason || 'No reason provided',
          rejectedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment request not found or already processed"
      });
    }
    
    const updatedAppointment = await appointmentsCollection.findOne({ 
      _id: new ObjectId(appointmentId) 
    });
    
    res.status(200).json({
      success: true,
      message: "Appointment request rejected successfully",
      data: updatedAppointment
    });
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject appointment",
      error: error.message
    });
  }
});

// Get pending appointment requests for a doctor
app.get("/api/appointments/requests/:doctorEmail", async (req, res) => {
  try {
    const { doctorEmail } = req.params;
    
    const database = client.db("HealthcareDB");
    const appointmentsCollection = database.collection("appointments");
    
    // Validate doctor email
    const doctorEmails = [
      'fahim@healthcare.com',
      'sakib@healthcare.com', 
      'samia@healthcare.com',
      'labib@healthcare.com'
    ];
    
    if (!doctorEmails.includes(doctorEmail.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor email"
      });
    }
    
    const pendingRequests = await appointmentsCollection.find({
      doctorEmail: doctorEmail.toLowerCase(),
      status: 'pending_request'
    }).sort({ createdAt: 1 }).toArray();
    
    res.status(200).json({
      success: true,
      message: "Pending appointment requests retrieved successfully",
      data: pendingRequests
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending requests",
      error: error.message
    });
  }
});

// Get appointments for a doctor
app.get("/api/appointments/doctor/:doctorEmail", async (req, res) => {
  try {
    const { doctorEmail } = req.params;
    
    const database = client.db("HealthcareDB");
    const appointmentsCollection = database.collection("appointments");
    
    // Validate doctor email
    const doctorEmails = [
      'fahim@healthcare.com',
      'sakib@healthcare.com', 
      'samia@healthcare.com',
      'labib@healthcare.com'
    ];
    
    if (!doctorEmails.includes(doctorEmail.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor email"
      });
    }
    
    const appointments = await appointmentsCollection.find({
      doctorEmail: doctorEmail.toLowerCase()
    }).sort({ appointmentDate: 1, appointmentTime: 1, serialNumber: 1 }).toArray();
    
    res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: appointments
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message
    });
  }
});

// Get appointments for a patient
app.get("/api/appointments/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const database = client.db("HealthcareDB");
    const appointmentsCollection = database.collection("appointments");
    
    const appointments = await appointmentsCollection.find({
      patientId
    }).sort({ appointmentDate: 1, appointmentTime: 1, serialNumber: 1 }).toArray();
    
    res.status(200).json({
      success: true,
      message: "Patient appointments retrieved successfully",
      data: appointments
    });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient appointments",
      error: error.message
    });
  }
});

// Update appointment status (for doctors) - now includes moving to patients collection
app.put("/api/appointments/:appointmentId/status", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: pending, confirmed, completed, or cancelled"
      });
    }
    
    const database = client.db("HealthcareDB");
    const appointmentsCollection = database.collection("appointments");
    const patientsCollection = database.collection("patients");
    const doctorsCollection = database.collection("doctors");
    
    // Get the original appointment to know its slot context
    const original = await appointmentsCollection.findOne({ _id: new ObjectId(appointmentId) });
    if (!original) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    
    // Update the appointment status
    await appointmentsCollection.updateOne(
      { _id: new ObjectId(appointmentId) },
      { 
        $set: { 
          status, 
          updatedAt: new Date(),
          ...(status === 'completed' && { completedAt: new Date() })
        } 
      }
    );
    
    // If status is 'completed', create patient record
    if (status === 'completed') {
      try {

        
        // Get doctor name from doctors collection
        const doctor = await doctorsCollection.findOne({
          "contactInfo.email": original.doctorEmail
        });
        
        const doctorName = doctor ? doctor.name : original.doctorEmail;
        
        // Check if patient already exists
        const existingPatient = await patientsCollection.findOne({ 
          email: original.patientEmail 
        });
        
        if (existingPatient) {
          // Update existing patient
          await patientsCollection.updateOne(
            { email: original.patientEmail },
            {
              $inc: { visits: 1 },
              $set: { lastVisit: original.appointmentDate },
              $push: {
                appointments: {
                  _id: original._id,
                  appointmentDate: original.appointmentDate,
                  appointmentTime: original.appointmentTime,
                  symptoms: original.symptoms,
                  status: 'completed',
                  serialNumber: original.serialNumber
                }
              }
            }
          );
          
          // Add prescription if available
          if (original.prescription) {
            const prescriptionData = {
              diagnosis: original.prescription.diagnosis,
              medications: original.prescription.medications,
              dosage: original.prescription.dosage,
              instructions: original.prescription.instructions,
              followUp: original.prescription.followUp || '',
              notes: original.prescription.notes || '',
              appointmentId: original._id,
              appointmentDate: original.appointmentDate,
              appointmentTime: original.appointmentTime,
              doctorEmail: original.doctorEmail,
              doctorName: doctorName,
              prescribedAt: original.prescription.prescribedAt || new Date()
            };
            
            await patientsCollection.updateOne(
              { email: original.patientEmail },
              {
                $push: { prescriptions: prescriptionData }
              }
            );
          }
        } else {

          
          const prescriptionArray = original.prescription ? [{
            diagnosis: original.prescription.diagnosis,
            medications: original.prescription.medications,
            dosage: original.prescription.dosage,
            instructions: original.prescription.instructions,
            followUp: original.prescription.followUp || '',
            notes: original.prescription.notes || '',
            appointmentId: original._id,
            appointmentDate: original.appointmentDate,
            appointmentTime: original.appointmentTime,
            doctorEmail: original.doctorEmail,
            doctorName: doctorName,
            prescribedAt: original.prescription.prescribedAt || new Date()
          }] : [];
          

          
          // Create new patient record
          const newPatient = {
            email: original.patientEmail,
            name: original.patientName,
            phone: original.patientPhone,
            age: original.patientAge,
            gender: original.patientGender,
            photoURL: null, // Will be updated if available
            visits: 1,
            lastVisit: original.appointmentDate,
            prescriptions: prescriptionArray,
            appointments: [{
              _id: original._id,
              appointmentDate: original.appointmentDate,
              appointmentTime: original.appointmentTime,
              symptoms: original.symptoms,
              status: 'completed',
              serialNumber: original.serialNumber
            }],
            createdAt: new Date()
          };
          

            
            await patientsCollection.insertOne(newPatient);
          }
      } catch (patientError) {
        console.error('Error creating patient record:', patientError);
        // Don't fail the appointment update if patient creation fails
      }
    }
    
    // If cancelled, resequence serial numbers for the same slot
    if (status === 'cancelled') {
      const activeStatuses = ['pending', 'confirmed'];
      const sameSlotActive = await appointmentsCollection
        .find({
          doctorEmail: original.doctorEmail,
          appointmentDate: original.appointmentDate,
          appointmentTime: original.appointmentTime,
          status: { $in: activeStatuses }
        })
        .sort({ createdAt: 1, _id: 1 })
        .toArray();
      
      const bulk = sameSlotActive.map((apt, idx) => ({
        updateOne: {
          filter: { _id: apt._id },
          update: { $set: { serialNumber: idx + 1 } }
        }
      }));
      if (bulk.length) {
        await appointmentsCollection.bulkWrite(bulk);
      }
    }
    
    const updatedAppointment = await appointmentsCollection.findOne({ _id: new ObjectId(appointmentId) });
    
    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully${status === 'completed' ? ' and patient record created' : ''}`,
      data: updatedAppointment
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
      error: error.message
    });
  }
});

// Get available slots for a doctor and date (with optional exclusion for rescheduling)
app.get("/api/appointments/available-slots", async (req, res) => {
  try {
    const { doctorEmail, appointmentDate, excludeAppointmentId } = req.query;

    if (!doctorEmail || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "doctorEmail and appointmentDate are required"
      });
    }

    const allSlots = [
      "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
      "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00",
      "16:00-17:00", "17:00-18:00"
    ];

    const database = client.db("HealthcareDB");
    const appointmentsCollection = database.collection("appointments");

    const query = {
      doctorEmail: doctorEmail.toLowerCase(),
      appointmentDate,
      status: { $in: ["pending", "confirmed"] }
    };

    // When rescheduling, ignore the patient's current appointment so they can keep it
    if (excludeAppointmentId) {
      query._id = { $ne: new ObjectId(excludeAppointmentId) };
    }

    // Count active bookings per slot
    const bookedAppointments = await appointmentsCollection
      .find(query, { projection: { appointmentTime: 1 } })
      .toArray();

    const slotToCount = bookedAppointments.reduce((acc, a) => {
      acc[a.appointmentTime] = (acc[a.appointmentTime] || 0) + 1;
      return acc;
    }, {});

    const MAX_PER_SLOT = 4;
    const availableSlots = allSlots.filter(slot => (slotToCount[slot] || 0) < MAX_PER_SLOT);

    return res.status(200).json({ success: true, data: availableSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ success: false, message: "Failed to fetch available slots", error: error.message });
  }
});

// Get completed appointments from patients collection
app.get("/api/patients/:doctorEmail", async (req, res) => {
  try {
    const { doctorEmail } = req.params;
    
    const database = client.db("HealthcareDB");
    const patientsCollection = database.collection("patients");
    
    // Validate doctor email
    const doctorEmails = [
      'fahim@healthcare.com',
      'sakib@healthcare.com', 
      'samia@healthcare.com',
      'labib@healthcare.com'
    ];
    
    if (!doctorEmails.includes(doctorEmail.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor email"
      });
    }
    
    console.log('🔍 Fetching patients for doctor:', doctorEmail.toLowerCase());
    
    // Find patients who have prescriptions or appointments with this doctor
    const completedPatients = await patientsCollection.find({
      $or: [
        { "prescriptions.doctorEmail": doctorEmail.toLowerCase() },
        { "appointments.doctorEmail": doctorEmail.toLowerCase() }
      ]
    }).sort({ lastVisit: -1 }).toArray();
    
    console.log('📊 Found patients:', completedPatients.length);
    if (completedPatients.length > 0) {
      console.log('🔍 Sample patient data:', {
        email: completedPatients[0].email,
        name: completedPatients[0].name,
        prescriptionsCount: completedPatients[0].prescriptions?.length || 0,
        appointmentsCount: completedPatients[0].appointments?.length || 0
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Completed patient records retrieved successfully",
      data: completedPatients
    });
  } catch (error) {
    console.error("Error fetching completed patients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch completed patients",
      error: error.message
    });
  }
});

// Add prescription to appointment
app.put("/api/appointments/:appointmentId/prescription", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { 
      diagnosis, 
      medications, 
      dosage, 
      instructions, 
      followUp, 
      notes 
    } = req.body;
    
    // Validate required fields
    if (!diagnosis || !medications || !dosage || !instructions) {
      return res.status(400).json({
        success: false,
        message: "Diagnosis, medications, dosage, and instructions are required"
      });
    }
    
    const database = client.db("HealthcareDB");
    const appointmentsCollection = database.collection("appointments");
    
    // Check if appointment exists and is active
    const appointment = await appointmentsCollection.findOne({ 
      _id: new ObjectId(appointmentId),
      status: { $in: ['approved', 'pending', 'confirmed'] }
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Active appointment not found"
      });
    }
    
    // Create prescription object
    const prescription = {
      diagnosis,
      medications,
      dosage,
      instructions,
      followUp: followUp || '',
      notes: notes || '',
      prescribedAt: new Date(),
      prescribedBy: appointment.doctorEmail
    };
    
    // Update appointment with prescription
    const result = await appointmentsCollection.updateOne(
      { _id: new ObjectId(appointmentId) },
      { 
        $set: { 
          prescription,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    const updatedAppointment = await appointmentsCollection.findOne({ 
      _id: new ObjectId(appointmentId) 
    });
    
    res.status(200).json({
      success: true,
      message: "Prescription added successfully",
      data: updatedAppointment
    });
  } catch (error) {
    console.error("Error adding prescription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add prescription",
      error: error.message
    });
  }
});

// Get appointment with prescription
app.get("/api/appointments/:appointmentId/prescription", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const database = client.db("HealthcareDB");
    const appointmentsCollection = database.collection("appointments");
    
    const appointment = await appointmentsCollection.findOne({ 
      _id: new ObjectId(appointmentId) 
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Appointment prescription retrieved successfully",
      data: {
        appointmentId: appointment._id,
        patientName: appointment.patientName,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        prescription: appointment.prescription || null
      }
    });
  } catch (error) {
    console.error("Error fetching appointment prescription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment prescription",
      error: error.message
    });
  }
});

// Debug endpoint to check appointment data
app.get("/api/appointments/:appointmentId/debug", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const database = client.db("HealthcareDB");
    const appointmentsCollection = database.collection("appointments");
    
    const appointment = await appointmentsCollection.findOne({ 
      _id: new ObjectId(appointmentId) 
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    console.log('🔍 Debug - Full appointment data:', JSON.stringify(appointment, null, 2));
    
    res.status(200).json({
      success: true,
      message: "Appointment debug data retrieved",
      data: {
        appointmentId: appointment._id,
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        status: appointment.status,
        prescription: appointment.prescription,
        hasPrescription: !!appointment.prescription,
        prescriptionFields: appointment.prescription ? Object.keys(appointment.prescription) : [],
        allFields: Object.keys(appointment)
      }
    });
  } catch (error) {
    console.error("Error fetching appointment debug data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment debug data",
      error: error.message
    });
  }
});

// Debug endpoint to check all patients in collection
app.get("/api/debug/patients", async (req, res) => {
  try {
    const database = client.db("HealthcareDB");
    const patientsCollection = database.collection("patients");
    
    const allPatients = await patientsCollection.find({}).toArray();
    
    console.log('🔍 Debug - All patients in collection:', allPatients.length);
    
    const samplePatients = allPatients.slice(0, 3).map(patient => ({
      email: patient.email,
      name: patient.name,
      prescriptionsCount: patient.prescriptions?.length || 0,
      appointmentsCount: patient.appointments?.length || 0,
      prescriptions: patient.prescriptions?.map(p => ({
        doctorEmail: p.doctorEmail,
        diagnosis: p.diagnosis
      })) || [],
      appointments: patient.appointments?.map(a => ({
        doctorEmail: a.doctorEmail,
        status: a.status
      })) || []
    }));
    
    console.log('🔍 Sample patients structure:', samplePatients);
    
    res.status(200).json({
      success: true,
      message: "Debug data retrieved successfully",
      data: {
        totalPatients: allPatients.length,
        samplePatients: samplePatients,
        allPatients: allPatients
      }
    });
  } catch (error) {
    console.error("Error fetching debug data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch debug data",
      error: error.message
    });
  }
});

// Get all patients for a doctor
app.get("/api/doctors/:doctorEmail/patients", async (req, res) => {
  try {
    const { doctorEmail } = req.params;
    
    const database = client.db("HealthcareDB");
    const patientsCollection = database.collection("patients");
    
    // Validate doctor email
    const doctorEmails = [
      'fahim@healthcare.com',
      'sakib@healthcare.com', 
      'samia@healthcare.com',
      'labib@healthcare.com'
    ];
    
    if (!doctorEmails.includes(doctorEmail.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor email"
      });
    }
    
    // Find patients who have appointments or prescriptions with this doctor
    const patients = await patientsCollection.find({
      $or: [
        { "appointments.doctorEmail": doctorEmail.toLowerCase() },
        { "prescriptions.doctorEmail": doctorEmail.toLowerCase() }
      ]
    }).sort({ lastVisit: -1 }).toArray();
    
    res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      data: patients
    });
  } catch (error) {
    console.error("Error fetching doctor's patients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
      error: error.message
    });
  }
});

// Add prescription directly to patient record
app.put("/api/patients/:patientEmail/prescription", async (req, res) => {
  try {
    const { patientEmail } = req.params;
    const prescriptionData = req.body;
    
    console.log('📝 Adding prescription to patient:', patientEmail);
    console.log('💊 Prescription data:', prescriptionData);
    
    const database = client.db("HealthcareDB");
    const patientsCollection = database.collection("patients");
    const doctorsCollection = database.collection("doctors");
    
    // Check if patient exists
    let patient = await patientsCollection.findOne({ email: patientEmail });
    
    if (!patient) {
      console.log('🆕 Patient not found, creating new patient record');
      
      // Get doctor name if available
      let doctorName = 'Unknown Doctor';
      if (prescriptionData.doctorEmail) {
        const doctor = await doctorsCollection.findOne({
          "contactInfo.email": prescriptionData.doctorEmail
        });
        doctorName = doctor ? doctor.name : prescriptionData.doctorEmail;
      }
      
      // Create new patient if doesn't exist
      const newPatient = {
        email: patientEmail,
        name: prescriptionData.patientName || 'Unknown',
        phone: prescriptionData.patientPhone || '',
        age: prescriptionData.patientAge || '',
        gender: prescriptionData.patientGender || '',
        photoURL: null,
        visits: 1,
        lastVisit: prescriptionData.appointmentDate || new Date().toISOString().split('T')[0],
        prescriptions: [],
        appointments: [],
        createdAt: new Date()
      };
      
      const result = await patientsCollection.insertOne(newPatient);
      patient = { ...newPatient, _id: result.insertedId };
      console.log('🆕 Created new patient record');
    }
    
    // Add prescription to patient
    const newPrescription = {
      diagnosis: prescriptionData.diagnosis,
      medications: prescriptionData.medications,
      dosage: prescriptionData.dosage || '',
      instructions: prescriptionData.instructions || '',
      followUp: prescriptionData.followUp || '',
      notes: prescriptionData.notes || '',
      appointmentId: prescriptionData.appointmentId || null,
      appointmentDate: prescriptionData.appointmentDate || null,
      appointmentTime: prescriptionData.appointmentTime || null,
      doctorEmail: prescriptionData.doctorEmail || null,
      doctorName: prescriptionData.doctorName || 'Unknown Doctor',
      prescribedAt: prescriptionData.prescribedAt || new Date()
    };
    
    console.log('💊 New prescription to add:', newPrescription);
    
    // Update patient with new prescription
    const updateResult = await patientsCollection.updateOne(
      { email: patientEmail },
      {
        $push: { prescriptions: newPrescription },
        $inc: { visits: 1 },
        $set: { 
          lastVisit: prescriptionData.appointmentDate || new Date().toISOString().split('T')[0],
          updatedAt: new Date()
        }
      }
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Failed to update patient record"
      });
    }
    
    // Add appointment to history if not exists and appointment data provided
    if (prescriptionData.appointmentId && prescriptionData.appointmentDate) {
      const appointmentExists = patient.appointments.find(apt => apt._id === prescriptionData.appointmentId);
      if (!appointmentExists) {
        await patientsCollection.updateOne(
          { email: patientEmail },
          {
            $push: {
              appointments: {
                _id: prescriptionData.appointmentId,
                appointmentDate: prescriptionData.appointmentDate,
                appointmentTime: prescriptionData.appointmentTime || '',
                symptoms: prescriptionData.symptoms || '',
                status: 'completed',
                serialNumber: prescriptionData.serialNumber || 1
              }
            }
          }
        );
        console.log('📅 Added appointment to patient history');
      }
    }
    
    // Get updated patient data
    const updatedPatient = await patientsCollection.findOne({ email: patientEmail });
    
    console.log('✅ Prescription added to patient successfully');
    
    res.status(200).json({
      success: true,
      message: 'Prescription added to patient record successfully',
      data: updatedPatient
    });
    
  } catch (error) {
    console.error('❌ Error adding prescription to patient:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Bhaai is running on port ${port}`);
});
