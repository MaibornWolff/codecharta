/**
 * A comprehensive sample class demonstrating various C++ features.
 * Used for golden file contract testing.
 */

#include <string>
#include <vector>
#include <algorithm>

namespace sample {

// Enum for testing
enum class Status {
    Pending,
    Active,
    Completed
};

// Class-level constant
constexpr int MAX_RETRIES = 3;

class Sample {
private:
    std::string prefix;
    int counter;

public:
    explicit Sample(const std::string& prefix = "Hello, ")
        : prefix(prefix), counter(0) {}

    /// Simple getter with no complexity
    int getCounter() const {
        return counter;
    }

    // Calculate sum with validation and control flow
    int calculate(int a, int b, int c, int d, int e) {
        if (a < 0 || b < 0) {
            return 0;
        }
        int sum = 0;
        for (int i = 0; i < c; i++) {
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
    std::string processData(const std::vector<std::string>& items) {
        std::string result;
        int count = 0;
        for (const auto& item : items) {
            if (item.empty()) {
                result += "empty";
            } else if (item.length() > 10) {
                for (int i = 0; i < 3; i++) {
                    result += item.substr(0, 5);
                }
            } else {
                result += item;
            }
            count++;
        }
        try {
            result += " total: " + std::to_string(count);
        } catch (...) {
            return "error";
        }
        return result;
    }

    // Method chaining example
    std::string chainedCall(const std::string& input) {
        std::string result = input;
        std::transform(result.begin(), result.end(), result.begin(), ::toupper);
        return result;
    }

    /**
     * Demonstrates switch expression usage.
     * @param type the type identifier
     * @return formatted result string
     */
    std::string formatByType(int type) {
        std::string label;
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
        return prefix + label;
    }

    // Template method example
    template<typename T>
    T transform(T value, T factor) {
        return value * factor;
    }

    // Lambda example
    int applyLambda(int value) {
        auto multiplier = [](int x) { return x * 2; };
        return multiplier(value);
    }
};

// Free function
std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

} // namespace sample
