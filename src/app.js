import express from 'express'
import cookieParser from 'cookie-parser'
import cors from "cors";

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const allowedOrigins = [
  "http://localhost:3000", // frontend (React or Next.js dev)
  "https://www.dreamschools.in", // production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ important: allow cookies (JWT) to be sent
  })
);

import authRouter from './routes/auth.route.js'


app.use('/api/v1/auth', authRouter)

export default app