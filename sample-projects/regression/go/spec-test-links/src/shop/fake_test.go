package shop

type fakePricer struct{}

func (f fakePricer) Amount() int {
	return 1
}
