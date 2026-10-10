const ValidationService = require('./ValidationService');

/**
 * RequestService
 * Handles the business logic for creating and managing Service Requests transactionally.
 */
class RequestService {
    constructor(db) {
        this.db = db;
    }

    /**
     * Helper to run queries with promises
     */
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) return reject(err);
                resolve(this);
            });
        });
    }

    /**
     * Helper to get single row
     */
    getQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    /**
     * Submit a new Service Request (Atomically)
     */
    async createRequest(userId, resourceId, baseValue, name = 'Default User', phone = '9876543210', description = 'Standard dispatch') {
        try {
            // 1. Validate Details before opening transaction (BR5 & T6)
            const detailsCheck = ValidationService.validateDetails({ name, phone, description });
            if (!detailsCheck.valid) throw new Error(detailsCheck.message);

            await this.runQuery('BEGIN TRANSACTION');

            // 2. Duplicate Submission Check (BR6 & T1)
            const duplicate = await this.getQuery(
                `SELECT id FROM ServiceRequest 
                 WHERE userId = ? AND resourceId = ? AND baseValue = ? AND name = ? AND phone = ? 
                   AND status = 'SUBMITTED' 
                   AND datetime(requestedDate) >= datetime('now', '-60 seconds')`,
                [userId, resourceId, baseValue, name, phone]
            );
            if (duplicate) {
                throw new Error("Duplicate request already submitted.");
            }

            // 3. Validate Active Request Limit (BR1 & T2)
            // Once a request is approved by admin (APPROVED/ASSIGNED, IN_PROGRESS, COMPLETED) or cancelled, user's intake slot is freed
            const activeRequests = await this.getQuery(
                `SELECT COUNT(*) as count FROM ServiceRequest WHERE userId = ? AND status NOT IN ('COMPLETED', 'CANCELLED', 'APPROVED/ASSIGNED', 'IN_PROGRESS')`,
                [userId]
            );
            const limitCheck = ValidationService.validateUserRequestLimit(activeRequests.count);
            if (!limitCheck.valid) throw new Error(limitCheck.message);

            // 4. Fetch & Validate Resource (BR2 & T3)
            const resource = await this.getQuery(`SELECT * FROM Resource WHERE id = ?`, [resourceId]);
            const resourceCheck = ValidationService.validateResourceAvailability(resource);
            if (!resourceCheck.valid) throw new Error(resourceCheck.message);

            // 5. Calculate Charge (BR4 & T4)
            const charge = ValidationService.calculateCharge(baseValue);

            // 6. Save Request with Snapshot (BR3, BR7 & T5, T12)
            const initialStatus = 'SUBMITTED';
            const resourceSnapshotCode = resource.code;
            const insertReq = await this.runQuery(
                `INSERT INTO ServiceRequest (userId, resourceId, resourceSnapshotCode, name, phone, description, status, baseValue, charge) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, resourceId, resourceSnapshotCode, name, phone, description, initialStatus, baseValue, charge]
            );
            const requestId = insertReq.lastID;

            // 7. Update Resource Capacity
            await this.runQuery(`UPDATE Resource SET capacity = capacity - 1 WHERE id = ?`, [resourceId]);

            // 8. Record Status History
            await this.runQuery(
                `INSERT INTO RequestStatusHistory (requestId, status) VALUES (?, ?)`,
                [requestId, initialStatus]
            );

            await this.runQuery('COMMIT');
            return { requestId, status: initialStatus, charge, resourceSnapshotCode };

        } catch (error) {
            await this.runQuery('ROLLBACK');
            throw error;
        }
    }

    /**
     * Update Request Status (Atomically & strict transitions)
     */
    async updateRequestStatus(requestId, newStatus, role = 'Administrator', userId = null) {
        try {
            await this.runQuery('BEGIN TRANSACTION');

            // 1. Fetch current request
            const request = await this.getQuery(`SELECT * FROM ServiceRequest WHERE id = ?`, [requestId]);
            if (!request) throw new Error("Request not found");

            // 2. Ownership check if role is User (BR10 & T8)
            if (role === 'User' && userId !== null && request.userId !== userId) {
                throw new Error("Forbidden: Not your request.");
            }

            // 3. Validate Transition (BR8, BR9 & T9, T10)
            const transitionCheck = ValidationService.validateStatusTransition(request.status, newStatus, role);
            if (!transitionCheck.valid) throw new Error(transitionCheck.message);

            // 4. Update Status
            await this.runQuery(`UPDATE ServiceRequest SET status = ? WHERE id = ?`, [newStatus, requestId]);

            // 5. Record Status History
            await this.runQuery(
                `INSERT INTO RequestStatusHistory (requestId, status) VALUES (?, ?)`,
                [requestId, newStatus]
            );

            // 6. If Cancelled, restore capacity exactly once (BR9 & T10)
            if (newStatus === 'CANCELLED') {
                await this.runQuery(`UPDATE Resource SET capacity = capacity + 1 WHERE id = ?`, [request.resourceId]);
            }

            await this.runQuery('COMMIT');
            return { requestId, status: newStatus };

        } catch (error) {
            await this.runQuery('ROLLBACK');
            throw error;
        }
    }
}

module.exports = RequestService;
