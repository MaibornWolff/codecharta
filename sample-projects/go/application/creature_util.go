package application

import (
	. "de.sots/cellarsandcentaurs/domain/model"
	_ "de.sots/cellarsandcentaurs/domain/service"
)

const StandardArmorClassDescription = "Natural Armor"

/* Counts the treasure hoard a creature guards. */
func TreasureHoard(creature *Creature) int {
	return creature.HitPoints().Max * creature.ArmorClass().Total()
}

func XPValueOf(centaur *Centaur) int {
	return centaur.XPValue
}
