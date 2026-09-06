package model

type Fightable interface {
	ArmorClass() ArmorClass
	HitPoints() HitPoints
	TakeDamage(damage int)
}
