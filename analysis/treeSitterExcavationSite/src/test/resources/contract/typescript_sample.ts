/**
 * A comprehensive sample class demonstrating various TypeScript features.
 * Used for golden file contract testing.
 */

// Interface for testing interface extraction
interface Processable {
    process(): string;
}

// Type alias for testing
type ResultType = { value: number; message: string };

// Enum for testing enum extraction
enum Status {
    PENDING = "pending",
    ACTIVE = "active",
    COMPLETED = "completed"
}

class Sample implements Processable {
    // Class-level constant
    private static readonly MAX_RETRIES = 3;
    private readonly prefix = "Hello, ";
    private counter = 0;

    /** Simple getter with no complexity */
    getCounter(): number {
        return this.counter;
    }

    // Calculate sum with validation and control flow
    calculate(a: number, b: number, c: number, d: number, e: number): number {
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
    processData(items: string[]): string {
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
    chainedCall(input: string | null): string | undefined {
        return input?.trim()
            .split("")
            .filter(c => c !== " ")
            .join("")
            .toUpperCase();
    }

    /**
     * Demonstrates switch expression usage.
     * @param type the type identifier
     * @returns formatted result string
     */
    formatByType(type: number): string {
        let label: string;
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
    transform = (value: number): number => {
        return value * 2;
    };

    // Template literal example
    greet(name: string): string {
        return `${this.prefix}${name}!`;
    }

    // Interface implementation
    process(): string {
        return "processed";
    }
}

export { Sample, Status, Processable, ResultType };
