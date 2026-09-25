package model

type ArmorClass struct {
	Description string
	Base        int
	Bonus       int
}

func NewArmorClass(base int, bonus int) ArmorClass {
	return ArmorClass{Description: "Natural Armor", Base: base, Bonus: bonus}
}

func (ac ArmorClass) Total() int {
	return ac.Base + ac.Bonus
}
