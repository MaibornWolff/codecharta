/**
 * A comprehensive sample class demonstrating various Swift features.
 * Used for golden file contract testing.
 */

import Foundation

// Protocol for testing
protocol Processable {
    func process() -> String
}

// Enum for testing
enum Status: String {
    case pending = "pending"
    case active = "active"
    case completed = "completed"
}

class Sample: Processable {
    // Class-level constant
    static let maxRetries = 3
    private let prefix: String
    private var counter = 0

    init(prefix: String = "Hello, ") {
        self.prefix = prefix
    }

    /// Simple getter with no complexity
    func getCounter() -> Int {
        return counter
    }

    // Calculate sum with validation and control flow
    func calculate(a: Int, b: Int, c: Int, d: Int, e: Int) -> Int {
        guard a >= 0, b >= 0 else {
            return 0
        }
        var sum = 0
        for _ in 0..<c {
            sum += a + b
        }
        var remaining = d
        while remaining > 0 {
            sum += remaining
            remaining -= 1
        }
        return sum + e
    }

    /*
     * A long method that processes data with nested logic.
     * This tests long_method detection (15+ lines).
     */
    func processData(items: [String]) -> String {
        var result = ""
        var count = 0
        for item in items {
            if item.isEmpty {
                result += "empty"
            } else if item.count > 10 {
                for _ in 0..<3 {
                    result += String(item.prefix(5))
                }
            } else {
                result += item
            }
            count += 1
        }
        do {
            result += " total: \(count)"
        } catch {
            return "error"
        }
        return result
    }

    // Method chaining example (triggers message_chains metric)
    func chainedCall(input: String?) -> String? {
        return input?
            .trimmingCharacters(in: .whitespaces)
            .uppercased()
            .replacingOccurrences(of: "A", with: "X")
            .replacingOccurrences(of: "B", with: "Y")
    }

    /**
     * Demonstrates switch expression usage.
     * - Parameter type: the type identifier
     * - Returns: formatted result string
     */
    func formatByType(type: Int) -> String {
        let label: String
        switch type {
        case 1:
            label = "one"
        case 2:
            label = "two"
        case 3:
            label = "three"
        default:
            label = "unknown"
        }
        return prefix + label
    }

    // Closure example
    func transform(value: Int, using closure: (Int) -> Int) -> Int {
        return closure(value)
    }

    // Protocol implementation
    func process() -> String {
        return "processed"
    }
}
