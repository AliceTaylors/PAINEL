import mongoose from "mongoose";

export default mongoose.models.Comment ||
  mongoose.model(
    "Comment",
    mongoose.Schema({
      author: String,
      text: String,
    })
  );
