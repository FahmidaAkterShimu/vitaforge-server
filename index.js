const express = require("express");
const cors = require('cors');
const dotenv = require('dotenv');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();

const uri = process.env.MONGODB_URI

const app = express()
const PORT = process.env.PORT

app.use(cors());
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
        // await client.connect();

        // await client.db("admin").command({ ping: 1 });
        // console.log("You successfully connected to MongoDB!");

        const database = client.db("VitaForge");

        // User dashboard collection
        const applicationCollection = database.collection("trainerApplications")

        // Trainer dashboard collection
        const classesCollection = database.collection("classes")

        const forumPostsCollection = database.collection("forumPosts");


        // ==== For USER Dashboard ====

        // Post API to post trainer-applications 
        app.post('/api/trainer-applications', async (req, res) => {
            const application = req.body;
            const result = await applicationCollection.insertOne(application);
            res.send(result);
        })

        // Get single class
        app.get("/api/classes/:id", async (req, res) => {
            const { id } = req.params;

            const result = await classesCollection.findOne({
                _id: new ObjectId(id),
            });

            res.json(result)
        });



        // ==== For TRAINER Dashboard ====

        // Post API to post a new class
        app.post('/api/classes', async (req, res) => {
            const newClass = req.body;
            const result = await classesCollection.insertOne(newClass);
            res.send(result);
        })

        //  Get API to get classes
        app.get('/api/classes', async (req, res) => {
            const query = {};
            if (req.query.trainerId) {
                query.trainerId = req.query.trainerId;
            }
            if (req.query.status) {
                query.status = req.query.status;
            }
            const cursor = classesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // Update Class API
        app.patch("/api/classes/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const updatedClass = req.body;

                const filter = {
                    _id: new ObjectId(id),
                };

                const updateDoc = {
                    $set: {
                        ...updatedClass,
                        updatedAt: new Date(),
                    },
                };

                const result = await classesCollection.updateOne(
                    filter,
                    updateDoc
                );

                if (result.matchedCount === 0) {
                    return res.status(404).send({
                        success: false,
                        message: "Class not found",
                    });
                }

                res.send({
                    success: true,
                    message: "Class updated successfully",
                });

            } catch (error) {
                console.error("Update class error:", error);

                res.status(500).send({
                    success: false,
                    message: "Failed to update class",
                });
            }
        });

        // Delete Class API
        app.delete("/api/classes/:id", async (req, res) => {
            try {
                const id = req.params.id;

                const result = await classesCollection.deleteOne({
                    _id: new ObjectId(id),
                });

                if (result.deletedCount === 0) {
                    return res.status(404).send({
                        success: false,
                        message: "Class not found",
                    });
                }

                res.send({
                    success: true,
                    message: "Class deleted successfully",
                });

            } catch (error) {
                console.error("Delete class error:", error);

                res.status(500).send({
                    success: false,
                    message: "Failed to delete class",
                });
            }
        });



        // Post API to post forum
        app.post("/api/forum-posts", async (req, res) => {
            try {
                const newForum = req.body;

                const result = await forumPostsCollection.insertOne(newForum);

                res.status(201).send({
                    success: true,
                    message: "Forum post created successfully",
                    insertedId: result.insertedId,
                });
            } catch (error) {
                console.error("Create forum post error:", error);

                res.status(500).send({
                    success: false,
                    message: "Failed to create forum post",
                });
            }
        });

        // Get API to get forum posts
        app.get("/api/forum-posts", async (req, res) => {
            try {
                const query = {};

                // Trainer's own posts
                if (req.query.trainerId) {
                    query.trainerId = req.query.trainerId;
                }

                const result = await forumPostsCollection
                    .find(query)
                    .sort({ createdAt: -1 })
                    .toArray();

                res.send(result);
            } catch (error) {
                console.error("Get forum posts error:", error);

                res.status(500).send({
                    success: false,
                    message: "Failed to get forum posts",
                });
            }
        });

        // Delete API to delete post
        app.delete("/api/forum-posts/:id", async (req, res) => {
            const { id } = req.params;
            // const { trainerId } = req.body;

            const result = await forumPostsCollection.deleteOne({
                _id: new ObjectId(id),
                // trainerId: trainerId,
            });
            res.send(result);
        });


        return client;
    } catch (error) {
        console.error(error);
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.json("VitaForge API is running");
});

app.listen(PORT, () => {
    console.log(`VitaForge server is running on port ${PORT}`)
});
