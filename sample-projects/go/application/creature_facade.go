package application

import (
	"de.sots/cellarsandcentaurs/application/dto"
	"de.sots/cellarsandcentaurs/domain/model"
	"de.sots/cellarsandcentaurs/domain/service"
)

const StandardCreatureType = model.Monstrosity

const stableName = "centaur-stable"

type CreatureFacade struct {
	creatureService *service.CreatureService
}

func NewCreatureFacade(creatureService *service.CreatureService) *CreatureFacade {
	return &CreatureFacade{creatureService: creatureService}
}

func (f *CreatureFacade) Create(request dto.Creature, armorClass model.ArmorClass) *model.Creature {
	// Rolls initiative for every creature in the dungeon before the encounter starts.
	creature := model.NewCreature(model.NewCreatureId())
	creature.SetType(model.CreatureType(request.Type))
	creature.SetArmorClass(armorClass)
	creature.SetHitPoints(model.InitHitPoints(request.HitPoints))

	walkingSpeed := model.NewSpeed(request.WalkingSpeed)
	speeds := map[model.SpeedType]model.Speed{
		model.Walking:   walkingSpeed,
		model.Flying:    model.NewSpeed(request.FlyingSpeed),
		model.Swimming:  model.NewSpeed(request.SwimmingSpeed),
		model.Burrowing: model.NewSpeed(request.BurrowingSpeed),
		model.Climbing:  model.NewSpeed(request.ClimbingSpeed),
	}
	creature.SetSpeeds(speeds)

	f.creatureService.Save(creature)
	return creature
}

func (f *CreatureFacade) Describe(creature *model.Creature) dto.Creature {
	return dto.Creature{Id: creature.Id().String(), Type: int(creature.Type()), Stable: stableName}
}
