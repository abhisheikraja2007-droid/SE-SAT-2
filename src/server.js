const express = require('express');
const cors = require('cors');

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const RequestService = require('./services/RequestService');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

const dbPath = path.resolve(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);
const requestService = new RequestService(db);

/**
 * Authentication Simulation Middleware
 */
const authSimulation = (req, res, next) => {
    const userId = req.header('X-User-Id');
    const role = req.header('X-Role');

    if (!userId || !role) {
        return res.status(401).json({ error: "Unauthorized. Please select a user or admin role." });
    }

    req.user = { id: parseInt(userId, 10), role: role };
    next();
};

// Endpoint: Reset Database to Seed Data (for test fixtures)
app.post('/api/reset-db', (req, res) => {
    const { exec } = require('child_process');
    exec('node src/db/init.js', (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Database reseeded successfully." });
    });
});

app.use('/api', authSimulation);

// Endpoint: Get Resources
app.get('/api/resources', (req, res) => {
    db.all(`SELECT * FROM Resource`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Endpoint: Get Requests
app.get('/api/requests', (req, res) => {
    let query = `
        SELECT sr.*, COALESCE(sr.resourceSnapshotCode, r.code) as resourceCode, r.code as currentResourceMasterCode 
        FROM ServiceRequest sr
        JOIN Resource r ON sr.resourceId = r.id
    `;
    const params = [];

    // Users only see their own, Admins see all (FR6 & BR10)
    if (req.user.role === 'User') {
        query += ` WHERE sr.userId = ?`;
        params.push(req.user.id);
    }
    
    query += ` ORDER BY sr.requestedDate DESC, sr.id DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Endpoint: Submit a Request
app.post('/api/requests', async (req, res) => {
    if (req.user.role !== 'User' && req.user.role !== 'Administrator') {
        return res.status(403).json({ error: "Forbidden: Unauthorized to submit requests." });
    }

    const { resourceId, baseValue, name, phone, description } = req.body;
    try {
        const result = await requestService.createRequest(
            req.user.id, 
            resourceId, 
            baseValue, 
            name || 'Default User', 
            phone || '9876543210', 
            description || 'Standard dispatch'
        );
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Endpoint: Update Request Status (Admin or User canceling)
app.put('/api/requests/:id/status', async (req, res) => {
    const { status } = req.body;
    
    // User logic (can only cancel their own SUBMITTED requests)
    if (req.user.role === 'User') {
        if (status !== 'CANCELLED') {
            return res.status(403).json({ error: "Forbidden: Users can only CANCEL requests." });
        }
        
        try {
            const result = await requestService.updateRequestStatus(req.params.id, status, 'User', req.user.id);
            res.json(result);
        } catch (err) {
            const statusCode = err.message.includes('Forbidden') ? 403 : 400;
            res.status(statusCode).json({ error: err.message });
        }
        return;
    }

    // Admin logic (strict status transitions)
    if (req.user.role !== 'Administrator') {
        return res.status(403).json({ error: "Forbidden: Unauthorized access." });
    }

    try {
        const result = await requestService.updateRequestStatus(req.params.id, status, 'Administrator');
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
