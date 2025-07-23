<?php

class Priority {
    const LOW = 'LOW';
    const MEDIUM = 'MEDIUM';
    const HIGH = 'HIGH';
    const OTHER = 'OTHER';
}

class TaskHelpers {
    // returns whether the task should have been done in the past
    public static function isTaskOverdue(DateTime $dueDate): bool {
        return $dueDate < new DateTime();
    }

    public static function getPriorityLabel(string $priority): string {
        switch ($priority) {
            case Priority::LOW:
                return "Low Priority";
            case Priority::MEDIUM:
                return "Medium Priority";
            case Priority::HIGH:
                return "High Priority";
            default:
                return "Unknown";
        }
    }

    public static function calculateDaysRemaining(DateTime $dueDate): int {
        $now = new DateTime();
        $interval = $now->diff($dueDate);
        $remaining = (int)$interval->format('%r%a');
        return $remaining < 0 ? 0 : $remaining;
    }
}
