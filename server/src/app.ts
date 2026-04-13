import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import userRoutes from './routes/user.routes';
import jobRoutes from "./routes/job.routes";
import parserRoutes from "./routes/parser.routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));           
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// ─── Rate limiting ────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 10,
  message: { message: "Too many attempts, please try again in 5 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/users', authLimiter, userRoutes);
app.use('/auth',  authLimiter, userRoutes);
app.use("/jobs",  jobRoutes);
app.use('/parse', parserRoutes);

export default app;