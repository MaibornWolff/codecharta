package shop

func Run() int {
	price := func() int { return 2 }
	return price()
}
