import mongoose from "mongoose";
import { DB_NAME } from "../../contents.js";

const connectDB = async () => {
  try {
    const instant = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      "DB connection conform " + `host ${instant.connection.host}`
    );
  } catch (error) {
    console.log(`Error in DB connection: ` + error.message);
    process.exit(1);
  }
};

export default connectDB;
