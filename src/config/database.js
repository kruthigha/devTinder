const mongoose = require("mongoose")

const connectDb = async() => {
    await mongoose.connect("mongodb+srv://kiruthiganat09:5cjbPUZPC4uOhxQ7@namastenode.jq2ub.mongodb.net/devTinder")
}

module.exports = {
    connectDb
}

