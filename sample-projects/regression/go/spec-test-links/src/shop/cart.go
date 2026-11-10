package shop

type Cart struct{}

func (c Cart) Total(p Pricer) int {
	return p.Amount()
}
