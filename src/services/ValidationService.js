/**
 * ValidationService
 * Handles business rules validation for resources and requests.
 */
class ValidationService {
    /**
     * BR1: Enforce active-request limit (max 5 per user)
     */
    static validateUserRequestLimit(activeRequestCount) {
        if (activeRequestCount >= 5) {
            return { valid: false, message: "Maximum of 5 active requests allowed. User has reached the limit." };
        }
        return { valid: true };
    }

    /**
     * BR2: Eligibility check (Resource must be active and have capacity)
     */
    static validateResourceAvailability(resource) {
        if (!resource) {
            return { valid: false, message: "Resource not found." };
        }
        if (resource.status !== 'Active') {
            return { valid: false, message: "Requested resource is inactive." };
        }
        if (resource.capacity <= 0) {
            return { valid: false, message: "Resource capacity is fully utilized." };
        }
        return { valid: true };
    }

    /**
     * BR4: Charge calculation logic (Rs.50 below base value Rs.1,000, and Rs.0 at Rs.1,000 or above)
     */
    static calculateCharge(baseValue) {
        const val = Number(baseValue);
        if (isNaN(val) || val < 1000) {
            return 50;
        }
        return 0;
    }

    /**
     * BR5: Details Validation (Name, 10-digit phone, description)
     */
    static validateDetails({ name, phone, description } = {}) {
        if (!name || typeof name !== 'string' || !name.trim()) {
            return { valid: false, message: "Name cannot be blank." };
        }
        if (!phone || !/^\d{10}$/.test(String(phone).trim())) {
            return { valid: false, message: "Phone must contain exactly 10 digits." };
        }
        if (!description || typeof description !== 'string' || !description.trim()) {
            return { valid: false, message: "Description cannot be blank." };
        }
        return { valid: true };
    }

    /**
     * BR8 & Status Transitions: Restrict the state machine sequence.
     * SUBMITTED -> APPROVED/ASSIGNED -> IN_PROGRESS -> COMPLETED, or CANCELLED
     */
    static validateStatusTransition(currentStatus, newStatus, role = 'Administrator') {
        if (currentStatus === 'CANCELLED') {
            return { valid: false, message: "Request is already cancelled." };
        }

        if (role === 'User') {
            if (currentStatus === 'SUBMITTED' && newStatus === 'CANCELLED') {
                return { valid: true };
            }
            return { valid: false, message: "Users can only cancel SUBMITTED requests." };
        }

        const allowedTransitions = {
            'SUBMITTED': ['APPROVED/ASSIGNED'],
            'APPROVED/ASSIGNED': ['IN_PROGRESS'],
            'IN_PROGRESS': ['COMPLETED'],
            'COMPLETED': []
        };

        if (allowedTransitions[currentStatus] && allowedTransitions[currentStatus].includes(newStatus)) {
            return { valid: true };
        }
        return { valid: false, message: `Invalid transition from ${currentStatus} to ${newStatus}. Cannot skip stages.` };
    }
}

module.exports = ValidationService;
