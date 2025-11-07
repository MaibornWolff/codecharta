// Swift sample file for testing metrics

import Foundation

/// A simple class demonstrating Swift features
class Calculator {
    var result: Int = 0

    // Computed property with getter
    var doubled: Int {
        return result * 2
    }

    // Property with observers
    var value: Int = 0 {
        willSet {
            print("About to set value")
        }
        didSet {
            print("Value was set")
        }
    }

    // Simple function
    func add(_ a: Int, _ b: Int) -> Int {
        return a + b
    }

    // Function with control flow
    func complexOperation(_ x: Int, _ y: Int) -> Int {
        if x > 0 && y > 0 {
            return x + y
        } else if x < 0 || y < 0 {
            return x - y
        } else {
            return 0
        }
    }

    // Guard statement
    func guardExample(_ value: Int?) -> Int {
        guard let unwrapped = value else {
            return 0
        }
        return unwrapped * 2
    }

    // Switch statement
    func switchExample(_ value: Int) -> String {
        switch value {
        case 0:
            return "zero"
        case 1...10:
            return "small"
        case 11...100:
            return "medium"
        default:
            return "large"
        }
    }

    // Loops
    func loopExamples() {
        for i in 0..<10 {
            print(i)
        }

        var count = 0
        while count < 5 {
            count += 1
        }

        repeat {
            count -= 1
        } while count > 0
    }

    // Nil-coalescing operator
    func nilCoalescing(_ optional: Int?) -> Int {
        return optional ?? 0
    }

    // Defer statement
    func deferExample() {
        defer {
            print("Cleanup")
        }
        print("Main work")
    }

    // Initializer
    init() {
        self.result = 0
    }

    // Deinitializer
    deinit {
        print("Calculator deallocated")
    }
}

// Closure examples
let simpleClosure = { (x: Int, y: Int) -> Int in
    return x + y
}

let numbers = [1, 2, 3, 4, 5]
let doubled = numbers.map { $0 * 2 }
let filtered = numbers.filter { $0 > 2 }

// Function with multiple parameters
func multipleParams(_ a: Int, _ b: Int, _ c: Int, _ d: Int) -> Int {
    return a + b + c + d
}

/*
 * Multi-line comment
 * spanning multiple lines
 * for testing
 */

// Struct with methods
struct Point {
    var x: Int
    var y: Int

    func distance(to other: Point) -> Double {
        let dx = Double(x - other.x)
        let dy = Double(y - other.y)
        return sqrt(dx * dx + dy * dy)
    }
}

// Error handling
enum CustomError: Error {
    case invalid
}

func throwingFunction() throws -> Int {
    throw CustomError.invalid
}

func catchExample() {
    do {
        let value = try throwingFunction()
        print(value)
    } catch {
        print("Error occurred")
    }
}
