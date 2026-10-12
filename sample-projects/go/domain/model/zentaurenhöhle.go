package model

// Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
type Zentaurenhöhle struct {
	rüstungsklasse ArmorClass
}

func (z Zentaurenhöhle) Describe() string {
	return "Größe der Höhle"
}
