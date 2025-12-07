const mongoose = require("mongoose");
const blogSchema = mongoose.Schema({
  title: String,
  description: String,
  file: String,
  email: String,
});
module.exports = mongoose.model("posts", blogSchema);
