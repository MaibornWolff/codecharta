package persistence

import (
	dm "de.sots/cellarsandcentaurs/domain/model"
)

type CreatureRepository struct {
	Repository[CreatureEntity]
}

func NewCreatureRepository() *CreatureRepository {
	return &CreatureRepository{Repository: NewRepository[CreatureEntity]()}
}

func (r *CreatureRepository) SaveCreature(creature *dm.Creature) {
	r.Save(toEntity(creature))
}

func toEntity(creature *dm.Creature) CreatureEntity {
	entity := NewCreatureEntity(creature.Id().String())
	entity.CreatureType = int(creature.Type())
	return entity
}
