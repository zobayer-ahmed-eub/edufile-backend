const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Database Connection Pool (Optimized for Azure)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }, // Required for Azure MySQL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// API Endpoint
app.post('/api/submitForm', async (req, res) => {
    const data = req.body;
    const table = data.database_table || "contact_inquiries";

    try {
        let sql = "";
        let values = [];

        if (table === 'admission_requests') {
            sql = 'INSERT INTO admission_requests (applicant_name, phone_number, destination, education_level) VALUES (?,?,?,?)';
            values = [data.applicant_name, data.phone_number, data.destination, data.education_level];
        } else if (table === 'visa_applications') {
            sql = 'INSERT INTO visa_applications (applicant_name, phone_number, visa_type, sponsor_type) VALUES (?,?,?,?)';
            values = [data.applicant_name, data.phone_number, data.visa_type, data.sponsor_type];
        } else {
            sql = 'INSERT INTO contact_inquiries (name, phone, message) VALUES (?,?,?)';
            values = [data.name || data.applicant_name, data.phone || data.phone_number, data.message || ""];
        }

        await pool.execute(sql, values);
        
        res.status(200).json({ status: "Success" });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Server Initialization
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
