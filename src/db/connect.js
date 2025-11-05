import mongoose from "mongoose";
async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("connect to mongodb")
  } catch (error) {
    console.log("error", error);

  }
}

export default connectDb