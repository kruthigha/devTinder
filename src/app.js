const express = require("express");
const { adminAuth, userAuth } = require("../Middleware/auth");
require("../src/config/database")
const app = express();

// Apply middleware to specific routes
app.use("/admin", adminAuth);
app.use("/user", userAuth);

// Admin routes
app.get("/admin/getAllData", (req, res) => {
    res.send("Sent all admin data");
});

app.get("/admin/deleteUser", (req, res) => {
    res.send("User Deleted!");
});

// User routes
app.post("/user/login", (req, res) => {
    res.send("User logged in successfully!");
});

app.get("/user", (req, res) => {
    res.send("User Data Sent");
});

app.get("/userErr", (req, res) => {
    try{
    throw new err("Hey err here")
    res.send("User Data Sent");
    } catch(err){
      res.status(404).send("Error handled gracefully!")
    }   
});


//errorHandling
app.use("/", (err, req, res, next) => {
    if(err){
        res.status(500).send("Something went Wrong!")
    }
})

// Start server
const PORT = 7777;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
