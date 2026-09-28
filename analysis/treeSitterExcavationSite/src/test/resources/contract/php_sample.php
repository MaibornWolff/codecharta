<?php
/**
 * A comprehensive sample class demonstrating various PHP features.
 * Used for golden file contract testing.
 */

namespace Sample;

use Exception;

// Interface for testing
interface Processable {
    public function process(): string;
}

// Enum for testing
enum Status: string {
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case COMPLETED = 'completed';
}

class Sample implements Processable {
    // Class-level constant
    private const MAX_RETRIES = 3;
    private string $prefix;
    private int $counter = 0;

    public function __construct(string $prefix = "Hello, ") {
        $this->prefix = $prefix;
    }

    /** Simple getter with no complexity */
    public function getCounter(): int {
        return $this->counter;
    }

    // Calculate sum with validation and control flow
    public function calculate(int $a, int $b, int $c, int $d, int $e): int {
        if ($a < 0 || $b < 0) {
            return 0;
        }
        $sum = 0;
        for ($i = 0; $i < $c; $i++) {
            $sum += $a + $b;
        }
        while ($d > 0) {
            $sum += $d;
            $d--;
        }
        return $sum + $e;
    }

    /*
     * A long method that processes data with nested logic.
     * This tests long_method detection (15+ lines).
     */
    public function processData(array $items): string {
        $result = "";
        $count = 0;
        foreach ($items as $item) {
            if ($item === null) {
                continue;
            }
            if (strlen($item) === 0) {
                $result .= "empty";
            } elseif (strlen($item) > 10) {
                for ($i = 0; $i < 3; $i++) {
                    $result .= substr($item, 0, 5);
                }
            } else {
                $result .= $item;
            }
            $count++;
        }
        try {
            $result .= " total: {$count}";
        } catch (Exception $e) {
            return "error";
        }
        return $result;
    }

    // Method chaining example (triggers message_chains metric)
    public function chainedCall(?string $input): ?string {
        return $input !== null
            ? strtoupper(trim(str_replace(['A', 'B'], ['X', 'Y'], $input)))
            : null;
    }

    /**
     * Demonstrates switch expression usage.
     * @param int $type the type identifier
     * @return string formatted result string
     */
    public function formatByType(int $type): string {
        $label = match ($type) {
            1 => "one",
            2 => "two",
            3 => "three",
            default => "unknown"
        };
        return $this->prefix . $label;
    }

    // Interface implementation
    public function process(): string {
        return "processed";
    }
}
