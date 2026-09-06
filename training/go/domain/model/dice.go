package model

import "math/rand"

type Dice struct {
	Sides int
}

type DiceRoll struct {
	Dice   Dice
	Result int
}

func (d Dice) Roll() DiceRoll {
	return DiceRoll{Dice: d, Result: rand.Intn(d.Sides) + 1}
}

func rollD20() DiceRoll {
	d20Roll := Dice{Sides: 20}.Roll()
	return d20Roll
}
