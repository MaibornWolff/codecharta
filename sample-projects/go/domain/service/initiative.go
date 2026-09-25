package service

import "de.sots/cellarsandcentaurs/domain/model"

func RerollInitiative(creature *model.Creature) int {
	dice := creature.RollInitiative().Dice
	reroll := dice.Roll
	return reroll().Result
}
