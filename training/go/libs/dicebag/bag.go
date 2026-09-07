package dicebag

type Bag struct {
	Sides []int
}

func Fill(sides ...int) Bag {
	return Bag{Sides: sides}
}
