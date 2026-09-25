package service

import "de.sots/cellarsandcentaurs/domain/model"

type Creatures interface {
	Save(creature *model.Creature) error
	Find(id model.CreatureId) (*model.Creature, error)
}
