package service

import (
	"log/slog"

	"de.sots/cellarsandcentaurs/domain/model"
)

type CreatureService struct {
	creatures Creatures
	logger    *slog.Logger
}

func NewCreatureService(creatures Creatures) *CreatureService {
	return &CreatureService{creatures: creatures, logger: slog.Default()}
}

func (s *CreatureService) Save(creature *model.Creature) error {
	s.logger.Info("saving creature", "id", creature.Id())
	return s.creatures.Save(creature)
}

func (s *CreatureService) Find(id model.CreatureId) (*model.Creature, error) {
	return s.creatures.Find(id)
}
