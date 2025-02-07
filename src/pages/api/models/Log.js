import mongoose from "mongoose";
import dbConnect from "../utils/dbConnect";
dbConnect();
export default mongoose.models.Log ||
  mongoose.model(
    "Log",
    mongoose.Schema({
      date: String,
      log: String,
    })
  );
