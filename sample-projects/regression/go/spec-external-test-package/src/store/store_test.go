package store_test

import (
	"testing"

	"example.com/m/store"
)

func setup() int { return store.Open() }

func TestOpen(t *testing.T) { _ = setup() }
