import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import userRoutes from './routes/user.routes';
import jobRoutes from "./routes/job.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/auth', userRoutes);
app.use('/jobs', jobRoutes);

export default app;
