import mongoose from "mongoose"


export const connectDB = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected...");
    })
    .catch((err) => {
      console.log(err);
    });
};
