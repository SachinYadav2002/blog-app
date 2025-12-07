const mongoose = require("mongoose");
const connectDb = () => {
  try {
    mongoose.connect("mongodb://localhost:27017/BlogApp");
    console.log("mongoose connected");
  } catch (error) {
    console.log("mongoose not connected");
  }
};
module.exports = connectDb;
