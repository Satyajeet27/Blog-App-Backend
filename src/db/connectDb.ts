import mongoose from "mongoose";
import config from "../config/config";

async function connectDb() {
  const uri = config.mongodb_uri as string;
  try {
    await mongoose.connect(uri);
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    // Ensures that the client will close when you finish/error
    console.log(error);
    process.exit(1);
  }
}
export default connectDb;
