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
    const { uid, email, role, displayName } = req.body;
    
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
    const { uid, email } = req.body;
    
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
    
    // Check if appointment time is available
    const existingAppointment = await appointmentsCollection.findOne({
      doctorEmail: doctorEmail.toLowerCase(),
      appointmentDate,
      appointmentTime,
      status: { $ne: 'cancelled' }
    });
    
    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked"
      });
    }
    
    // Create new appointment
    const newAppointment = {
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
      status: 'pending', // pending, confirmed, completed, cancelled
      createdAt: new Date()
    };
    
    const result = await appointmentsCollection.insertOne(newAppointment);
    
    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        _id: result.insertedId,
        ...newAppointment
      }
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
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
    }).sort({ appointmentDate: 1, appointmentTime: 1 }).toArray();
    
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
    }).sort({ appointmentDate: 1, appointmentTime: 1 }).toArray();
    
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

// Update appointment status (for doctors)
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
    
    const result = await appointmentsCollection.updateOne(
      { _id: new ObjectId(appointmentId) },
      { $set: { status, updatedAt: new Date() } }
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
      message: "Appointment status updated successfully",
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

    const bookedAppointments = await appointmentsCollection
      .find(query, { projection: { appointmentTime: 1 } })
      .toArray();

    const bookedSlots = new Set(bookedAppointments.map(a => a.appointmentTime));
    const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot));

    return res.status(200).json({ success: true, data: availableSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ success: false, message: "Failed to fetch available slots", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Bhaai is running on port ${port}`);
});
