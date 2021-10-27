const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(express.json());
app.use(cors());

//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.072tx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    //
    const database = client.db("carMechanic");
    //everything would be inside services
    const serviceCollection = database.collection("services");
    //To get all the services from API.
    //GET API
    app.get("/services", async (req, res) => {
      // const query = { runtime: { $lt: 15 } };
      const cursor = serviceCollection.find({});
      // console.log(cursor);
      const services = await cursor.toArray();
      res.send(services);
    });
    //getting a single obj using its id
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    //PUT API
    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const service = req.body;
      console.log("hitting update");
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateService = {
        $set: {
          name: service.name,
          price: service.price,
          image: service.image,
          description: service.description,
        },
      };
      const result = await serviceCollection.updateOne(
        filter,
        updateService,
        options
      );
      console.log(result);
      res.json(result);
    });
    // how to send data from client to database through server
    //we have to call the POST API to HIT that else no data would enter,and when it comes from UI than it hit the post
    //POSTAPI
    app.post("/services", async (req, res) => {
      const service = req.body;
      console.log("hitting the post", req.body);
      const result = await serviceCollection.insertOne(service);
      console.log(result);
      res.json(result);
    });
    //DELETE API
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      // console.log("deleting id", id);
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Loading car mechanic");
});
app.get("/hello", (req, res) => {
  res.send("hello update here");
});
app.listen(port, () => {
  console.log("listening to port", port);
});
