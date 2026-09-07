package sample;

import java.util.List;
import java.util.Optional;

/**
 * A comprehensive sample class demonstrating various Java features.
 * Used for golden file contract testing.
 */
@SuppressWarnings("unused")
public class Sample {
    // Class-level constant
    private static final int MAX_RETRIES = 3;
    private final String prefix = "Hello, ";
    private int counter;

    /** Simple getter with no complexity */
    public int getCounter() {
        return counter;
    }

    // Calculate sum with validation and control flow
    public int calculate(int a, int b, int c, int d, int e) {
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
    public String processData(List<String> items) {
        StringBuilder result = new StringBuilder();
        int count = 0;
        for (String item : items) {
            if (item == null) {
                continue;
            }
            if (item.isEmpty()) {
                result.append("empty");
            } else if (item.length() > 10) {
                for (int i = 0; i < 3; i++) {
                    result.append(item.substring(0, 5));
                }
            } else {
                result.append(item);
            }
            count++;
        }
        try {
            result.append(" total: ").append(count);
        } catch (Exception e) {
            return "error";
        }
        return result.toString();
    }

    // Method chaining example (triggers message_chains metric)
    public Optional<String> chainedCall(String input) {
        return Optional.ofNullable(input)
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(s -> s.toUpperCase());
    }

    /**
     * Demonstrates switch expression and lambda usage.
     * @param type the type identifier
     * @return formatted result string
     */
    public String formatByType(int type) {
        String label = switch (type) {
            case 1 -> "one";
            case 2 -> "two";
            case 3 -> "three";
            default -> "unknown";
        };
        return prefix + label;
    }

    // Inner enum for testing enum extraction
    public enum Status {
        PENDING, ACTIVE, COMPLETED
    }
}
