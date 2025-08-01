import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/connectDB.js';
import authRoutes from './routes/member/auth.routes.js';
import memberRoutes from './routes/member/member.route.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

// ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/member', memberRoutes);

//START SERVER
connectDB();
const PORT = process.env.PORT || 5100;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

