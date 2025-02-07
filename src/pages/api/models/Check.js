import mongoose from "mongoose";

export default mongoose.models.Check ||
  mongoose.model(
    "Check",
    mongoose.Schema({
      number: String,
      result: String,
      bin: String,
    })
  );
