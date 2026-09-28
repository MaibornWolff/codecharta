package application

import "de.sots/cellarsandcentaurs/domain/model"

func KindOf(fightable model.Fightable) string {
	switch fightable.(type) {
	case *model.Centaur:
		return "centaur"
	default:
		return "creature"
	}
}
