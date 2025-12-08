const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const { ObjectId } = require("mongodb");

require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("styleDecor");
    const servicesCollection = db.collection("services");

    // POST service
    app.post("/services", async (req, res) => {
      try {
        const service = req.body;
        if (!service || Object.keys(service).length === 0) {
          return res.status(400).send({ error: "Service data is required" });
        }
        const result = await servicesCollection.insertOne(service);
        res.status(201).send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to add service" });
      }
    });

    app.get("/services", async (req, res) => {
      try {
        const id = req.query.id;

        if (id) {
          // Fetch a single service by MongoDB ObjectId
          const service = await servicesCollection.findOne({
            _id: new ObjectId(id),
          });
          if (!service) {
            return res.status(404).send({ error: "Service not found" });
          }
          return res.status(200).json(service);
        }

        // Fetch all services if no id is provided
        const services = await servicesCollection.find({}).toArray();
        res.status(200).json(services);
      } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ error: "Failed to fetch services" });
      }
    });

    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

// Call run to connect to MongoDB
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
