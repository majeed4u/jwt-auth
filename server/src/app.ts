import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorMiddleware } from './middlewares/error.middleware'
import { securityMiddleware } from './middlewares/security.middleware'
import authRoutes from './routes/auth.route'

const app = express()

// Security middleware should be first
app.use(securityMiddleware)

// CORS should be first to handle preflight requests
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Add both localhost variations
    credentials: true, // Allow cookies to be sent with requests
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"], // Add Cookie header
    exposedHeaders: ["Set-Cookie"], // Expose Set-Cookie header to frontend
    optionsSuccessStatus: 200 // For legacy browser support
}))

// Then other middleware
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.json({ message: "API is healthy 🌿" })
})

app.use("/api/v1/auth", authRoutes)

// Error handling middleware should be last
app.use(errorMiddleware);

export default app