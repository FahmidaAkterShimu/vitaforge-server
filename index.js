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
        const userCollection = database.collection("user");

        const applicationCollection = database.collection("trainerApplications")

        // Trainer dashboard collection
        const classesCollection = database.collection("classes")

        const forumPostsCollection = database.collection("forumPosts");


        //Transactions
        const transactionsCollection = database.collection("transactions");


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

                if (req.query.trainerId) {
                    query.trainerId = req.query.trainerId;
                }

                const limit = Number(req.query.limit) || 0;

                let cursor = forumPostsCollection
                    .find(query)
                    .sort({ createdAt: -1 });

                if (limit > 0) {
                    cursor = cursor.limit(limit);
                }

                const result = await cursor.toArray();

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

        // Get API for Forum post details
        app.get("/api/forum-posts/:id", async (req, res) => {
            try {
                const { id } = req.params;


                const post = await forumPostsCollection.findOne({
                    _id: new ObjectId(id),
                });

                if (!post) {
                    return res.status(404).send({
                        success: false,
                        message: "Forum post not found",
                    });
                }

                res.send(post);
            } catch (error) {
                console.error("Get forum post error:", error);

                res.status(500).send({
                    success: false,
                    message: "Failed to get forum post",
                });
            }

        });


        // =====================================================
        // ADMIN APIs
        // =====================================================

        // Admin dashboard statistics
        app.get("/api/admin/stats", async (req, res) => {
            try {
                const [
                    totalUsers,
                    totalClasses,
                    totalBookedClasses,
                    pendingApplications,
                    pendingClasses,
                    totalTrainers,
                ] = await Promise.all([
                    userCollection.countDocuments({
                        role: { $ne: "admin" },
                    }),

                    classesCollection.countDocuments(),

                    database
                        .collection("bookings")
                        .countDocuments(),

                    applicationCollection.countDocuments({
                        status: "Pending",
                    }),

                    classesCollection.countDocuments({
                        status: "Pending",
                    }),

                    userCollection.countDocuments({
                        role: "trainer",
                    }),
                ]);

                res.json({
                    success: true,
                    data: {
                        totalUsers,
                        totalClasses,
                        totalBookedClasses,
                        pendingApplications,
                        pendingClasses,
                        totalTrainers,
                    },
                });
            } catch (error) {
                console.error("Admin stats error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to load admin statistics",
                });
            }
        });

        // Get All Users
        app.get("/api/admin/users", async (req, res) => {
            try {
                const page = Math.max(Number(req.query.page) || 1, 1);
                const limit = Math.min(
                    Math.max(Number(req.query.limit) || 10, 1),
                    100
                );

                const search = req.query.search?.trim() || "";
                const role = req.query.role || "";

                const query = {};

                if (search) {
                    query.$or = [
                        {
                            name: {
                                $regex: search,
                                $options: "i",
                            },
                        },
                        {
                            email: {
                                $regex: search,
                                $options: "i",
                            },
                        },
                    ];
                }

                if (role && role !== "all") {
                    query.role = role;
                }

                const total = await userCollection.countDocuments(query);

                const users = await userCollection
                    .find(query)
                    .project({
                        name: 1,
                        email: 1,
                        image: 1,
                        role: 1,
                        blocked: 1,
                        createdAt: 1,
                    })
                    .sort({
                        createdAt: -1,
                    })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .toArray();

                res.json({
                    success: true,
                    data: users,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                });
            } catch (error) {
                console.error("Get admin users error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to load users",
                });
            }
        });

        // Block/ Unblock User
        app.patch("/api/admin/users/:id/status", async (req, res) => {
            try {
                const { id } = req.params;
                const { blocked } = req.body;

                if (typeof blocked !== "boolean") {
                    return res.status(400).json({
                        success: false,
                        message: "blocked must be boolean",
                    });
                }

                const result = await userCollection.updateOne(
                    {
                        _id: new ObjectId(id),
                        role: { $ne: "admin" },
                    },
                    {
                        $set: {
                            blocked,
                            updatedAt: new Date(),
                        },
                    }
                );

                if (!result.matchedCount) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found",
                    });
                }

                res.json({
                    success: true,
                    message: blocked
                        ? "User blocked successfully"
                        : "User unblocked successfully",
                });
            } catch (error) {
                console.error("User status error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to update user status",
                });
            }
        });

        // Make Admin
        app.patch("/api/admin/users/:id/role", async (req, res) => {
            try {
                const { id } = req.params;
                const { role } = req.body;

                const allowedRoles = ["user", "trainer", "admin"];

                if (!allowedRoles.includes(role)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid role",
                    });
                }

                const result = await userCollection.updateOne(
                    {
                        _id: new ObjectId(id),
                    },
                    {
                        $set: {
                            role,
                            updatedAt: new Date(),
                        },
                    }
                );

                if (!result.matchedCount) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found",
                    });
                }

                res.json({
                    success: true,
                    message: `User role changed to ${role}`,
                });
            } catch (error) {
                console.error("Role update error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to update role",
                });
            }
        });

        // Admin manage Trainer applications
        app.get("/api/admin/trainer-applications", async (req, res) => {
            try {
                const applications = await applicationCollection
                    .find({})
                    .sort({
                        createdAt: -1,
                    })
                    .toArray();

                res.json({
                    success: true,
                    data: applications,
                });
            } catch (error) {
                console.error("Trainer applications error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to load trainer applications",
                });
            }
        });

        // Approved trainer
        app.patch("/api/admin/trainer-applications/:id/approve", async (req, res) => {
            try {
                const { id } = req.params;

                const application = await applicationCollection.findOne({
                    _id: new ObjectId(id),
                });

                if (!application) {
                    return res.status(404).json({
                        success: false,
                        message: "Application not found",
                    });
                }

                const userId =
                    application.userId ||
                    application.user?.id ||
                    application.user?.userId;

                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: "Application does not contain userId",
                    });
                }

                let userQuery;

                // userId যদি ObjectId হয়
                if (ObjectId.isValid(String(userId))) {
                    userQuery = {
                        _id: new ObjectId(String(userId)),
                    };
                } else {
                    // fallback
                    userQuery = {
                        id: String(userId),
                    };
                }

                const user = await userCollection.findOne(userQuery);

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found",
                        userId,
                    });
                }

                const userResult = await userCollection.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            role: "trainer",
                            updatedAt: new Date(),
                        },
                    }
                );

                if (!userResult.modifiedCount && user.role !== "trainer") {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to update user role",
                    });
                }

                await applicationCollection.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: {
                            status: "Approved",
                            reviewedAt: new Date(),
                        },
                    }
                );

                res.json({
                    success: true,
                    message: "Trainer approved successfully",
                    userId: user._id,
                });
            } catch (error) {
                console.error("Approve trainer error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to approve trainer",
                });
            }
        });
        // Reject Trainer
        app.patch(
            "/api/admin/trainer-applications/:id/reject",
            async (req, res) => {
                try {
                    const { id } = req.params;
                    const { feedback = "" } = req.body;

                    const result =
                        await applicationCollection.updateOne(
                            {
                                _id: new ObjectId(id),
                            },
                            {
                                $set: {
                                    status: "Rejected",
                                    feedback,
                                    reviewedAt: new Date(),
                                },
                            }
                        );

                    if (!result.matchedCount) {
                        return res.status(404).json({
                            success: false,
                            message: "Application not found",
                        });
                    }

                    res.json({
                        success: true,
                        message: "Trainer application rejected",
                    });
                } catch (error) {
                    console.error("Reject trainer error:", error);

                    res.status(500).json({
                        success: false,
                        message: "Failed to reject application",
                    });
                }
            }
        );

        // Manage Trainers
        app.get("/api/admin/trainers", async (req, res) => {
            try {
                const trainers = await userCollection
                    .find({
                        role: "trainer",
                    })
                    .project({
                        name: 1,
                        email: 1,
                        image: 1,
                        role: 1,
                        blocked: 1,
                        createdAt: 1,
                    })
                    .sort({
                        createdAt: -1,
                    })
                    .toArray();

                res.json({
                    success: true,
                    data: trainers,
                });
            } catch (error) {
                console.error("Get trainers error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to load trainers",
                });
            }
        });

        // Demote trainer
        app.patch("/api/admin/trainers/:id/demote", async (req, res) => {
            try {
                const { id } = req.params;

                const result = await userCollection.updateOne(
                    {
                        _id: new ObjectId(id),
                        role: "trainer",
                    },
                    {
                        $set: {
                            role: "user",
                            updatedAt: new Date(),
                        },
                    }
                );

                if (!result.matchedCount) {
                    return res.status(404).json({
                        success: false,
                        message: "Trainer not found",
                    });
                }

                res.json({
                    success: true,
                    message: "Trainer demoted to user",
                });
            } catch (error) {
                console.error("Demote trainer error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to demote trainer",
                });
            }
        });

        // Admin Classes API
        app.get("/api/admin/classes", async (req, res) => {
            try {
                const page = Math.max(Number(req.query.page) || 1, 1);
                const limit = Math.min(
                    Math.max(Number(req.query.limit) || 10, 1),
                    100
                );

                const search = req.query.search?.trim() || "";
                const status = req.query.status || "";

                const query = {};

                if (search) {
                    query.name = {
                        $regex: search,
                        $options: "i",
                    };
                }

                if (status && status !== "all") {
                    query.status = status;
                }

                const total = await classesCollection.countDocuments(query);

                const classes = await classesCollection
                    .find(query)
                    .sort({
                        createdAt: -1,
                    })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .toArray();

                res.json({
                    success: true,
                    data: classes,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                });
            } catch (error) {
                console.error("Admin classes error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to load classes",
                });
            }
        });

        // Approve / Reject
        app.patch("/api/admin/classes/:id/status", async (req, res) => {
            try {
                const { id } = req.params;
                const { status } = req.body;

                if (!["Approved", "Rejected", "Pending"].includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid class status",
                    });
                }

                const result = await classesCollection.updateOne(
                    {
                        _id: new ObjectId(id),
                    },
                    {
                        $set: {
                            status,
                            updatedAt: new Date(),
                        },
                    }
                );

                if (!result.matchedCount) {
                    return res.status(404).json({
                        success: false,
                        message: "Class not found",
                    });
                }

                res.json({
                    success: true,
                    message: `Class ${status.toLowerCase()} successfully`,
                });
            } catch (error) {
                console.error("Admin class status error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to update class",
                });
            }
        });

        // Delete
        app.delete("/api/admin/classes/:id", async (req, res) => {
            try {
                const { id } = req.params;

                const result = await classesCollection.deleteOne({
                    _id: new ObjectId(id),
                });

                if (!result.deletedCount) {
                    return res.status(404).json({
                        success: false,
                        message: "Class not found",
                    });
                }

                res.json({
                    success: true,
                    message: "Class deleted successfully",
                });
            } catch (error) {
                console.error("Admin delete class error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to delete class",
                });
            }
        });

        // Admin Forum API
        app.get("/api/admin/forum", async (req, res) => {
            try {
                const posts = await forumPostsCollection
                    .find({})
                    .sort({
                        createdAt: -1,
                    })
                    .toArray();

                res.json({
                    success: true,
                    data: posts,
                });
            } catch (error) {
                console.error("Admin forum error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to load forum posts",
                });
            }
        });

        //Dlete
        app.delete("/api/admin/forum/:id", async (req, res) => {
            try {
                const { id } = req.params;

                const result = await forumPostsCollection.deleteOne({
                    _id: new ObjectId(id),
                });

                if (!result.deletedCount) {
                    return res.status(404).json({
                        success: false,
                        message: "Forum post not found",
                    });
                }

                res.json({
                    success: true,
                    message: "Forum post deleted successfully",
                });
            } catch (error) {
                console.error("Admin forum delete error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to delete forum post",
                });
            }
        });

        // Transactions
        app.get("/api/admin/transactions", async (req, res) => {
            try {
                const transactions =
                    await transactionsCollection
                        .find({})
                        .sort({
                            createdAt: -1,
                        })
                        .toArray();

                res.json({
                    success: true,
                    data: transactions,
                });
            } catch (error) {
                console.error("Transactions error:", error);

                res.status(500).json({
                    success: false,
                    message: "Failed to load transactions",
                });
            }
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