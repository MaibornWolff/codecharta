package model

import (
	"de.sots/cellarsandcentaurs/application"
)

var _ Fightable = (*Creature)(nil)

// A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
type Creature struct {
	id         CreatureId
	kind       CreatureType
	armorClass ArmorClass
	speeds     map[SpeedType]Speed
	hitPoints  HitPoints
}

func NewCreature(id CreatureId) *Creature {
	return NewCreatureOfType(id, application.StandardCreatureType)
}

func NewCreatureOfType(id CreatureId, kind CreatureType) *Creature {
	return &Creature{id: id, kind: kind, speeds: make(map[SpeedType]Speed)}
}

func (c *Creature) Id() CreatureId {
	return c.id
}

func (c *Creature) Type() CreatureType {
	return c.kind
}

func (c *Creature) SetType(kind CreatureType) {
	c.kind = kind
}

func (c *Creature) ArmorClass() ArmorClass {
	return c.armorClass
}

func (c *Creature) SetArmorClass(armorClass ArmorClass) {
	c.armorClass = armorClass
}

func (c *Creature) Speeds() map[SpeedType]Speed {
	return c.speeds
}

func (c *Creature) SetSpeeds(speeds map[SpeedType]Speed) {
	c.speeds = speeds
}

func (c *Creature) HitPoints() HitPoints {
	return c.hitPoints
}

func (c *Creature) SetHitPoints(hitPoints HitPoints) {
	c.hitPoints = hitPoints
}

func (c *Creature) TakeDamage(damage int) {
	c.hitPoints = c.hitPoints.TakeDamage(damage)
}

func (c *Creature) RollInitiative() DiceRoll {
	return rollD20()
}
