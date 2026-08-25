require("dotenv").config();

const express = require("express");

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.json("VitaForge API is running");
});

app.listen(PORT, () => {
    console.log(`VitaForge server is running on port ${PORT}`)
});
