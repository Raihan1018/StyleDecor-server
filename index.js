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
    const expertsCollection = db.collection("experts");
    const clientReviewsCollection = db.collection("clientReviews");

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

    const { ObjectId } = require("mongodb");

    // Update a service by ID
    app.put("/services/:id", async (req, res) => {
      try {
        const { id } = req.params; // service ID from URL
        const updatedData = req.body; // new service data from request body

        if (!updatedData || Object.keys(updatedData).length === 0) {
          return res.status(400).json({ error: "Update data is required" });
        }

        const result = await servicesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Service not found" });
        }

        res.status(200).json({
          message: "Service updated successfully",
          updatedCount: result.modifiedCount,
        });
      } catch (error) {
        console.error("Error updating service:", error);
        res.status(500).json({ error: "Failed to update service" });
      }
    });

    // experts
    app.post("/experts", async (req, res) => {
      try {
        const experts = req.body;
        if (!experts || Object.keys(experts).length === 0) {
          return res.status(400).send({ error: "experts data is required" });
        }
        const result = await expertsCollection.insertOne(experts);
        res.status(201).send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to add experts" });
      }
    });

    app.get("/experts", async (req, res) => {
      try {
        const id = req.query.id;

        if (id) {
          const expert = await expertsCollection.findOne({
            _id: new ObjectId(id),
          });
          if (!expert) {
            return res.status(404).send({ error: "Expert not found" });
          }
          return res.status(200).json(expert);
        }

        // Fetch all experts
        const experts = await expertsCollection.find({}).toArray();
        res.status(200).json(experts);
      } catch (error) {
        console.error("Error fetching experts:", error);
        res.status(500).json({ error: "Failed to fetch experts" });
      }
    });

    // POST client review with current date/time
    app.post("/clientReviews", async (req, res) => {
      try {
        const clientReview = req.body;
        if (!clientReview || Object.keys(clientReview).length === 0) {
          return res
            .status(400)
            .send({ error: "clientReview data is required" });
        }

        // Add current date/time
        clientReview.createdAt = new Date();

        const result = await clientReviewsCollection.insertOne(clientReview);
        res.status(201).send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to add client review" });
      }
    });

    // GET all client reviews
    app.get("/clientReviews", async (req, res) => {
      try {
        const clientReviews = await clientReviewsCollection
          .find({})
          .sort({ createdAt: -1 }) // latest reviews first
          .toArray();
        res.status(200).json(clientReviews);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch client reviews" });
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
