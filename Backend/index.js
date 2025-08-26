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

    // POST new appointment
    app.post('/api/appointments', async(req, res) => {
      try {
        const appointmentData = {
          ...req.body,
          status: 'pending',
          createdAt: new Date(),
        };
        
        const result = await appointmentsCollection.insertOne(appointmentData);
        
        res.json({
          success: true,
          message: "Appointment booked successfully",
          appointmentId: result.insertedId
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error booking appointment",
          error: error.message
        });
      }
    });

    // GET all appointments (optional - for admin)
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
