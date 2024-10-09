import express from "express";
const app = express();
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root_dir = __dirname.split("src")[0];
import cors from "cors";
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import { connectDB } from "./utils/connectDB.js";
import morgan from "morgan";
import rateLimiter from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import "express-async-errors";
import dotenv from "dotenv";
dotenv.config({ path: path.join(root_dir, `.env`) });
// cors
const whitelist = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://localhost:3000/",
];
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  allowedHeaders: "*",
  "Access-Control-Request-Headers": "*",
};
export const cookieOptions = {
	secure: true,
	httpOnly: true,
	sameSite: 'strict'
}
app.set("trust proxy", 1);
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000,
//     max: 1000,
//   })
// );
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json());
app.use(morgan("tiny"));

// Route
// app.get("/", (req, res) => {
//   res.send("<h1>Hello World</h1>");
// });
import indexRouter from "./routers/index.js";
app.use("/api/v1", indexRouter);
app.post('/webhook/v1/participant-registration',zohoFormsWebhook)
app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
// Error Handlers
import { notFoundMiddleware } from "./middleware/not-found.js";
app.use(notFoundMiddleware);
import { errorHandlerMiddleware } from './middleware/errorHandler.js'; // Use the correct file extension
import { zohoFormsWebhook } from "./controllers/operations.js";
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server listening at http://127.0.0.1:${port}`);
    });
    console.log(process.env.NODE_ENV);
  } catch (error) {
    console.log("Something went wrong");
  }
};

start();
