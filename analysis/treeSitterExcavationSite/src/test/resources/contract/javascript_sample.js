/**
 * A comprehensive sample class demonstrating various JavaScript features.
 * Used for golden file contract testing.
 */

// Class-level constant
const MAX_RETRIES = 3;

class Sample {
    constructor(prefix = "Hello, ") {
        this.prefix = prefix;
        this.counter = 0;
    }

    /** Simple getter with no complexity */
    getCounter() {
        return this.counter;
    }

    // Calculate sum with validation and control flow
    calculate(a, b, c, d, e) {
        if (a < 0 || b < 0) {
            return 0;
        }
        let sum = 0;
        for (let i = 0; i < c; i++) {
            sum += a + b;
        }
        while (d > 0) {
            sum += d;
            d--;
        }
        return sum + e;
    }

    /*
     * A long method that processes data with nested logic.
     * This tests long_method detection (15+ lines).
     */
    processData(items) {
        let result = "";
        let count = 0;
        for (const item of items) {
            if (item === null) {
                continue;
            }
            if (item.length === 0) {
                result += "empty";
            } else if (item.length > 10) {
                for (let i = 0; i < 3; i++) {
                    result += item.substring(0, 5);
                }
            } else {
                result += item;
            }
            count++;
        }
        try {
            result += ` total: ${count}`;
        } catch (e) {
            return "error";
        }
        return result;
    }

    // Method chaining example (triggers message_chains metric)
    chainedCall(input) {
        return input?.trim()
            .split("")
            .filter(c => c !== " ")
            .join("")
            .toUpperCase();
    }

    /**
     * Demonstrates switch expression usage.
     * @param {number} type - the type identifier
     * @returns {string} formatted result string
     */
    formatByType(type) {
        let label;
        switch (type) {
            case 1:
                label = "one";
                break;
            case 2:
                label = "two";
                break;
            case 3:
                label = "three";
                break;
            default:
                label = "unknown";
        }
        return this.prefix + label;
    }

    // Arrow function example
    transform = (value) => {
        return value * 2;
    };
}

// Utility function with template literal
function greet(name) {
    return `Hello, ${name}!`;
}

module.exports = { Sample, MAX_RETRIES, greet };
