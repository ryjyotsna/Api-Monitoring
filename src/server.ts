import express from "express";
import helmet from "helmet";
import cors from "cors";

// Initialize the Express app
const app = express();

// Middleware
app.use(helmet()); // Security
app.use(cors());  
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

