package shop

import "testing"

func TestTotal(t *testing.T) {
	Cart{}.Total(fakePricer{})
}
