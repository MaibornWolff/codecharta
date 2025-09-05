package helpers

import (
	"time"
)

// Priority type
type Priority int

const (
	LOW Priority = iota
	MEDIUM
	HIGH
	OTHER
)

// IsTaskOverdue returns whether the task should have been done in the past
func IsTaskOverdue(dueDate time.Time) bool {
	return dueDate.Before(time.Now())
}

// GetPriorityLabel returns a string label for the priority
func GetPriorityLabel(priority Priority) string {
	switch priority {
	case LOW:
		return "Low Priority"
	case MEDIUM:
		return "Medium Priority"
	case HIGH:
		return "High Priority"
	default:
		return "Unknown"
	}
}

// CalculateDaysRemaining returns the number of days remaining until dueDate
func CalculateDaysRemaining(dueDate time.Time) int {
	remaining := int(dueDate.Sub(time.Now()).Hours() / 24)
	if remaining < 0 {
		return 0
	}
	return remaining
}
