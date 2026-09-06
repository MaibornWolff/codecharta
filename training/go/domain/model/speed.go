package model

type Speed struct {
	Feet int
}

func NewSpeed(feet int) Speed {
	return Speed{Feet: feet}
}
