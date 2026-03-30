require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bookRoutes = require('./routes/bookRoutes'); // Path to your router

const app = express();

// 1. GLOBAL MIDDLEWARE
app.use(cors()); // Allows your frontend to talk to this backend
app.use(morgan('dev')); // Logs all requests to the terminal for debugging
app.use(express.json()); // Essential: Parses incoming JSON bodies
app.use(express.urlencoded({ extended: true }));

// 2. API ROUTES
// All book-related logic is now prefixed with /api/books
app.use('/api/books', bookRoutes);

// 3. HEALTH CHECK & ROOT ROUTE
app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Personal Library API", status: "Running" });
});

// 4. GLOBAL ERROR HANDLER
// Catch-all for any errors that weren't caught in controllers
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong on the server",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 5. SERVER STARTUP
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n📚 Library Backend Live`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🚀 Try: http://localhost:${PORT}/api/books\n`);
});