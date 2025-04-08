const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config('.env')
const MongoDbURI = process.env.MONGODB_URI
const connectDB = () =>{ mongoose.connect(MongoDbURI).then(()=>{
    console.log("Connected to MongoDB")
});
}

module.exports = connectDB;