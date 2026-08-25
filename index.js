const express = require("express");
const dotenv = require('dotenv');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();

const uri = process.env.MONGODB_URI

const app = express()
const PORT = process.env.PORT

app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        await client.db("admin").command({ ping: 1 });
        console.log("You successfully connected to MongoDB!");


        return client;
    } finally {
        await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.json("VitaForge API is running");
});

app.listen(PORT, () => {
    console.log(`VitaForge server is running on port ${PORT}`)
});
