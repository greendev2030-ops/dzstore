/**
 * Valid return reasons
 */
export const VALID_RETURN_REASONS = [
    "DAMAGED",
    "WRONG_ITEM",
    "NOT_WORKING",
    "WRONG_SIZE",
    "POOR_QUALITY",
    "LATE_DELIVERY",
    "WRONG_ORDER",
    "OTHER",
] as const;

export type ReturnReason = (typeof VALID_RETURN_REASONS)[number];

/**
 * Return status values
 */
export const RETURN_STATUSES = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "COMPLETED",
] as const;

export type ReturnStatus = (typeof RETURN_STATUSES)[number];

/**
 * Configuration
 */
export const RETURN_CONFIG = {
    RETURN_PERIOD_DAYS: 7,
    POINTS_FOR_RETURN_REQUEST: -10,
    POINTS_FOR_RETURN_REJECTED: 5,
    POINTS_FOR_RETURN_COMPLETED: 0,
    MAX_IMAGES_PER_RETURN: 5,
} as const;

/**
 * Validate Algerian phone number
 */
export function isValidAlgerianPhone(phone: string): boolean {
    return /^(05|06|07)[0-9]{8}$/.test(phone);
}

/**
 * Validate return reason
 */
export function isValidReturnReason(reason: string): reason is ReturnReason {
    return VALID_RETURN_REASONS.includes(reason as ReturnReason);
}

/**
 * Validate return status
 */
export function isValidReturnStatus(status: string): status is ReturnStatus {
    return RETURN_STATUSES.includes(status as ReturnStatus);
}

/**
 * Validate return request data
 */
export interface ReturnRequestValidation {
    valid: boolean;
    errors: string[];
}

export function validateReturnRequest(data: {
    order_id?: unknown;
    product_id?: unknown;
    customer_phone?: unknown;
    reason?: unknown;
    detailed_reason?: unknown;
    images?: unknown;
}): ReturnRequestValidation {
    const errors: string[] = [];

    // Check required fields
    if (!data.order_id || typeof data.order_id !== "string") {
        errors.push("order_id is required and must be a string");
    }

    if (!data.product_id || typeof data.product_id !== "string") {
        errors.push("product_id is required and must be a string");
    }

    if (!data.customer_phone || typeof data.customer_phone !== "string") {
        errors.push("customer_phone is required and must be a string");
    } else if (!isValidAlgerianPhone(data.customer_phone)) {
        errors.push("Invalid Algerian phone number format (must be 05/06/07 followed by 8 digits)");
    }

    if (!data.reason || typeof data.reason !== "string") {
        errors.push("reason is required and must be a string");
    } else if (!isValidReturnReason(data.reason)) {
        errors.push(`Invalid return reason. Must be one of: ${VALID_RETURN_REASONS.join(", ")}`);
    }

    // Check optional fields
    if (data.detailed_reason !== undefined && data.detailed_reason !== null) {
        if (typeof data.detailed_reason !== "string") {
            errors.push("detailed_reason must be a string");
        } else if (data.detailed_reason.length > 500) {
            errors.push("detailed_reason must not exceed 500 characters");
        }
    }

    if (data.images !== undefined && data.images !== null) {
        if (!Array.isArray(data.images)) {
            errors.push("images must be an array");
        } else if (data.images.length > RETURN_CONFIG.MAX_IMAGES_PER_RETURN) {
            errors.push(`images must not exceed ${RETURN_CONFIG.MAX_IMAGES_PER_RETURN} items`);
        } else {
            // Check each image URL
            for (let i = 0; i < data.images.length; i++) {
                if (typeof data.images[i] !== "string") {
                    errors.push(`images[${i}] must be a string URL`);
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
