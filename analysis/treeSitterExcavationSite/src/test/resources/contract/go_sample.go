// Package sample provides a comprehensive example demonstrating various Go features.
// Used for golden file contract testing.
package sample

import (
	"errors"
	"strings"
)

// MaxRetries is the maximum number of retry attempts
const MaxRetries = 3

// Status represents the processing status
type Status int

const (
	Pending Status = iota
	Active
	Completed
)

// Sample represents a sample struct with various methods
type Sample struct {
	prefix  string
	counter int
}

// NewSample creates a new Sample instance
func NewSample(prefix string) *Sample {
	return &Sample{prefix: prefix, counter: 0}
}

// GetCounter is a simple getter with no complexity
func (s *Sample) GetCounter() int {
	return s.counter
}

// Calculate computes a sum with validation and control flow
func (s *Sample) Calculate(a, b, c, d, e int) int {
	if a < 0 || b < 0 {
		return 0
	}
	sum := 0
	for i := 0; i < c; i++ {
		sum += a + b
	}
	for d > 0 {
		sum += d
		d--
	}
	return sum + e
}

/*
ProcessData is a long method that processes data with nested logic.
This tests long_method detection (15+ lines).
*/
func (s *Sample) ProcessData(items []string) (string, error) {
	var result strings.Builder
	count := 0
	for _, item := range items {
		if item == "" {
			result.WriteString("empty")
		} else if len(item) > 10 {
			for i := 0; i < 3; i++ {
				result.WriteString(item[:5])
			}
		} else {
			result.WriteString(item)
		}
		count++
	}
	if count == 0 {
		return "", errors.New("no items")
	}
	result.WriteString(" total: ")
	return result.String(), nil
}

// ChainedCall demonstrates method chaining
func (s *Sample) ChainedCall(input string) string {
	return strings.ToUpper(strings.TrimSpace(strings.ReplaceAll(strings.ReplaceAll(input, "A", "X"), "B", "Y")))
}

// FormatByType demonstrates switch expression usage
func (s *Sample) FormatByType(typeID int) string {
	var label string
	switch typeID {
	case 1:
		label = "one"
	case 2:
		label = "two"
	case 3:
		label = "three"
	default:
		label = "unknown"
	}
	return s.prefix + label
}

// Processable defines an interface for processing
type Processable interface {
	Process() string
}

// Process implements the Processable interface
func (s *Sample) Process() string {
	return "processed"
}
