package shop

import "example.com/m/model"

type Cart struct{}

func (cart *Cart) Total() model.Money { return model.Money{} }
