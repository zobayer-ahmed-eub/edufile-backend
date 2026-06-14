const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

// Middleware to allow your website to talk to this API
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/api/submitForm', async (req, res) => {
    const data = req.body;
    const table = data.database_table || "contact_inquiries";

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });

        // Insert Logic
        if (table === 'admission_requests') {
            await connection.execute('INSERT INTO admission_requests (applicant_name, phone_number, destination, education_level) VALUES (?,?,?,?)', [data.applicant_name, data.phone_number, data.destination, data.education_level]);
        } else if (table === 'visa_applications') {
            await connection.execute('INSERT INTO visa_applications (applicant_name, phone_number, visa_type, sponsor_type) VALUES (?,?,?,?)', [data.applicant_name, data.phone_number, data.visa_type, data.sponsor_type]);
        } else {
            await connection.execute('INSERT INTO contact_inquiries (name, phone, message) VALUES (?,?,?)', [data.name || data.applicant_name, data.phone || data.phone_number, data.message || ""]);
        }

        await connection.end();
        res.status(200).json({ status: "Success" });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));