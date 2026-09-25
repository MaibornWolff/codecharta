package service_test

import (
	"testing"

	entity "de.sots/cellarsandcentaurs/adapter/persistence"
	"de.sots/cellarsandcentaurs/domain/model"
	"de.sots/cellarsandcentaurs/domain/service"
)

func Test_should_save_creature_to_the_stable(t *testing.T) {
	creatures := entity.NewPersistedCreatures(entity.NewCreatureRepository())
	creatureService := service.NewCreatureService(creatures)
	creature := model.NewCreature(model.NewCreatureId())
	walking_speed := model.NewSpeed(30)
	creature.SetSpeeds(map[model.SpeedType]model.Speed{model.Walking: walking_speed})

	err := creatureService.Save(creature)

	if err != nil {
		t.Fatalf("expected the creature to be saved, got %v", err)
	}
	found, _ := creatureService.Find(creature.Id())
	if found.Id() != creature.Id() {
		t.Errorf("expected creature %s in the stable", creature.Id())
	}
}
