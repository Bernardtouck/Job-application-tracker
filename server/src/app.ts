import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import userRoutes from './routes/user.routes';
import jobRoutes from "./routes/job.routes";
import parserRoutes from "./routes/parser.routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));           
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use('/users', userRoutes);   // POST /users (register), GET /users
app.use('/auth', userRoutes);    // POST /auth/login
app.use("/jobs",  jobRoutes);    // CRUD /jobs
app.use('/parse', parserRoutes);     // POST /parse/text, POST /parse/image

export default app;
