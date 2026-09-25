package persistence

import (
	"de.sots/cellarsandcentaurs/application"
	"de.sots/cellarsandcentaurs/domain/model"
	"de.sots/cellarsandcentaurs/domain/service"
)

var _ service.Creatures = (*PersistedCreatures)(nil)

type PersistedCreatures struct {
	repository *CreatureRepository
}

func NewPersistedCreatures(repository *CreatureRepository) *PersistedCreatures {
	return &PersistedCreatures{repository: repository}
}

func (p *PersistedCreatures) Save(creature *model.Creature) error {
	p.repository.SaveCreature(creature)
	return nil
}

func (p *PersistedCreatures) Find(id model.CreatureId) (*model.Creature, error) {
	entity, found := p.repository.FindOne(id.String())
	if !found {
		return nil, model.NewNoSuchCreatureException(id)
	}
	return model.NewCreatureOfType(model.CreatureIdOf(entity.Id), application.StandardCreatureType), nil
}
