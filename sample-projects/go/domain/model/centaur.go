package model

type Centaur struct {
	Creature
	XPValue int
}

func NewCentaur(id CreatureId) *Centaur {
	centaur := &Centaur{Creature: *NewCreatureOfType(id, Monstrosity), XPValue: 450}
	centaur.SetArmorClass(NewArmorClass(12, 0))
	return centaur
}

func (c *Centaur) Charge() Speed {
	return c.Speeds()[Walking]
}
