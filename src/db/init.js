const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Drop existing tables for a clean slate
    db.run(`DROP TABLE IF EXISTS RequestStatusHistory`);
    db.run(`DROP TABLE IF EXISTS ServiceRequest`);
    db.run(`DROP TABLE IF EXISTS Resource`);
    db.run(`DROP TABLE IF EXISTS User`);

    // 1. Create User Table
    db.run(`CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        role TEXT
    )`);

    // 2. Create Resource Table
    db.run(`CREATE TABLE IF NOT EXISTS Resource (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE,
        capacity INTEGER,
        status TEXT
    )`);

    // 3. Create ServiceRequest Table
    db.run(`CREATE TABLE IF NOT EXISTS ServiceRequest (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        resourceId INTEGER,
        resourceSnapshotCode TEXT,
        name TEXT,
        phone TEXT,
        description TEXT,
        status TEXT,
        baseValue REAL,
        charge REAL,
        requestedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES User(id),
        FOREIGN KEY(resourceId) REFERENCES Resource(id)
    )`);

    // 4. Create RequestStatusHistory Table
    db.run(`CREATE TABLE IF NOT EXISTS RequestStatusHistory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestId INTEGER,
        status TEXT,
        changedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(requestId) REFERENCES ServiceRequest(id)
    )`);

    console.log("Tables created successfully.");

    // Insert Seed Data (2 Users, 1 Admin)
    const insertUser = db.prepare(`INSERT INTO User (id, username, role) VALUES (?, ?, ?)`);
    insertUser.run(1, 'user1', 'User');
    insertUser.run(2, 'user2', 'User');
    insertUser.run(3, 'admin1', 'Administrator');
    insertUser.finalize();

    // Insert Resource Seed Data: S101 (Capacity 10, Active), S102 (Capacity 5, Active), and S103 (Capacity 0, Inactive)
    const insertResource = db.prepare(`INSERT INTO Resource (id, code, capacity, status) VALUES (?, ?, ?, ?)`);
    insertResource.run(1, 'S101', 10, 'Active');
    insertResource.run(2, 'S102', 5, 'Active');
    insertResource.run(3, 'S103', 0, 'Inactive');
    insertResource.finalize();

    console.log("Seed data inserted successfully.");
});

db.close();
