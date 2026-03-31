require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

// 1. GLOBAL MIDDLEWARE
// Updated CORS to allow your specific Vercel frontend to communicate with Render
const allowedOrigins = [
    'https://book-shelf-virid.vercel.app',
    /\.vercel\.app$/  // This allows ANY subdomain of vercel.app
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some((allowed) => {
            if (allowed instanceof RegExp) return allowed.test(origin);
            return allowed === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. API ROUTES
app.use('/api/books', bookRoutes);

// 3. HEALTH CHECK & ROOT ROUTE
app.get('/', (req, res) => {
    res.json({ 
        message: "Welcome to the Personal Library API", 
        status: "Running",
        environment: process.env.NODE_ENV || 'development'
    });
});

// 4. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong on the server",
        // Only show detailed error stack in development mode
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 5. SERVER STARTUP
// Render sets the PORT automatically; default to 10000 if not found
const PORT = process.env.PORT || 10000;
const serverUrl = process.env.NODE_ENV === 'production' 
    ? 'https://book-shelf-ncza.onrender.com' 
    : `http://localhost:${PORT}`;

app.listen(PORT, () => {
    console.log(`\n📚 Library Backend Live`);
    console.log(`📍 Status: Online`);
    console.log(`🚀 API Endpoint: ${serverUrl}/api/books\n`);
});