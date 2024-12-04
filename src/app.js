const express = require("express")
const app = express()
//req handlers

app.use("/hlo",(req,res)=>{
res.send("Hello from server")
})

app.use("/test",(req,res)=>{
    res.send("Hello from test server")
})

app.listen(3000,()=>{
    console.log("Server is listening on port 3000")
})
app.use("/test1",(req,res)=>{
    res.send("Hello from pseudo test server")
})
