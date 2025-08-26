const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pyoefad.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const doctorsCollection = client.db("HealthcareDB").collection("doctors");
    const appointmentsCollection = client.db("HealthcareDB").collection("appointments");
    const patientsCollection = client.db("HealthcareDB").collection("patients");
    
    // GET all doctors
    app.get('/api/doctors', async(req, res) => {
      try {
        const result = await doctorsCollection.find().toArray();
        res.json({
          success: true,
          doctors: result
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error fetching doctors",
          error: error.message
        });
      }
    });

    // GET single doctor by ID
    app.get('/api/doctors/:id', async(req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const doctor = await doctorsCollection.findOne(query);
        
        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: "Doctor not found"
          });
        }
        
        res.json({
          success: true,
          doctor: doctor
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error fetching doctor",
          error: error.message
        });
      }
    });

    // POST new appointment with patient data
    app.post('/api/appointments', async(req, res) => {
      try {
        const {
          // Patient data
          patientName,
          patientEmail,
          patientPhone,
          age,
          gender,
          // Appointment data
          appointmentDate,
          appointmentTime,
          symptoms,
          // Doctor data
          doctorId,
          doctorName,
          doctorSpecialization,
          doctorDepartment,
          consultationFee
        } = req.body;

        // Step 1: Check if patient exists or create new patient
        let patient = await patientsCollection.findOne({ email: patientEmail });
        
        if (!patient) {
          // Create new patient if doesn't exist
          const newPatient = {
            name: patientName,
            email: patientEmail,
            phone: patientPhone,
            age: parseInt(age),
            gender: gender,
            registeredDate: new Date(),
            appointments: [], // Array to store appointment IDs
            medicalHistory: [],
            lastUpdated: new Date()
          };
          
          const patientResult = await patientsCollection.insertOne(newPatient);
          patient = { ...newPatient, _id: patientResult.insertedId };
        } else {
          // Update existing patient information
          await patientsCollection.updateOne(
            { _id: patient._id },
            {
              $set: {
                name: patientName,
                phone: patientPhone,
                age: parseInt(age),
                gender: gender,
                lastUpdated: new Date()
              }
            }
          );
        }

        // Step 2: Create appointment
        const appointmentData = {
          patientId: patient._id,
          patientName: patientName,
          patientEmail: patientEmail,
          patientPhone: patientPhone,
          patientAge: parseInt(age),
          patientGender: gender,
          doctorId: new ObjectId(doctorId),
          doctorName: doctorName,
          doctorSpecialization: doctorSpecialization,
          doctorDepartment: doctorDepartment,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          symptoms: symptoms,
          consultationFee: consultationFee,
          status: 'pending', // pending, confirmed, completed, cancelled
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const appointmentResult = await appointmentsCollection.insertOne(appointmentData);
        
        // Step 3: Update patient document with new appointment ID
        await patientsCollection.updateOne(
          { _id: patient._id },
          {
            $push: { appointments: appointmentResult.insertedId },
            $set: { lastAppointmentDate: appointmentDate }
          }
        );
        
        res.json({
          success: true,
          message: "Appointment booked successfully",
          appointmentId: appointmentResult.insertedId,
          patientId: patient._id,
          isNewPatient: !patient.email
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error booking appointment",
          error: error.message
        });
      }
    });

    // GET all appointments
    app.get('/api/appointments', async(req, res) => {
      try {
        const appointments = await appointmentsCollection.find().toArray();
        res.json({
          success: true,
          appointments: appointments
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error fetching appointments",
          error: error.message
        });
      }
    });

    // GET appointments by patient email
    app.get('/api/appointments/patient/:email', async(req, res) => {
      try {
        const email = req.params.email;
        const appointments = await appointmentsCollection.find({ patientEmail: email }).toArray();
        res.json({
          success: true,
          appointments: appointments
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error fetching patient appointments",
          error: error.message
        });
      }
    });

    // GET all patients
    app.get('/api/patients', async(req, res) => {
      try {
        const patients = await patientsCollection.find().toArray();
        res.json({
          success: true,
          patients: patients
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error fetching patients",
          error: error.message
        });
      }
    });

    // GET single patient by email
    app.get('/api/patients/:email', async(req, res) => {
      try {
        const email = req.params.email;
        const patient = await patientsCollection.findOne({ email: email });
        
        if (!patient) {
          return res.status(404).json({
            success: false,
            message: "Patient not found"
          });
        }
        
        // Get patient's appointments
        const appointments = await appointmentsCollection.find({ patientEmail: email }).toArray();
        
        res.json({
          success: true,
          patient: {
            ...patient,
            appointmentHistory: appointments
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error fetching patient",
          error: error.message
        });
      }
    });

    // UPDATE appointment status
    app.patch('/api/appointments/:id/status', async(req, res) => {
      try {
        const id = req.params.id;
        const { status } = req.body;
        
        const result = await appointmentsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: status,
              updatedAt: new Date()
            }
          }
        );
        
        if (result.modifiedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Appointment not found"
          });
        }
        
        res.json({
          success: true,
          message: "Appointment status updated successfully"
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error updating appointment",
          error: error.message
        });
      }
    });

    // DELETE appointment (soft delete - just change status)
    app.delete('/api/appointments/:id', async(req, res) => {
      try {
        const id = req.params.id;
        
        const result = await appointmentsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: 'cancelled',
              cancelledAt: new Date(),
              updatedAt: new Date()
            }
          }
        );
        
        if (result.modifiedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Appointment not found"
          });
        }
        
        res.json({
          success: true,
          message: "Appointment cancelled successfully"
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error cancelling appointment",
          error: error.message
        });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Healthcare API Running Successfully!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
