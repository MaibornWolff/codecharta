package service

import (
	"fmt"

	"de.sots/cellarsandcentaurs/domain/model"
)

// EncounterResolver decides how an encounter between two creatures ends.
// It compares the attack roll with the armor class of the defender,
// walks over the speeds of the attacker and applies the terrain.
// The numbers are kept small on purpose so that every branch
// can be counted by hand.
// Go has no ternary, no while and no try, see FINDINGS.md.
type EncounterResolver struct {
	rounds   int
	critical bool
}

func (r *EncounterResolver) Resolve(attacker *model.Creature, defender *model.Creature, roll int, bonus int, terrain string) int {
	// a natural one always misses
	if roll == 1 {
		return 0
	} else if roll == 20 {
		bonus += 2
	} else {
		bonus += 1
	}
	damage := roll + bonus
	for speedType, speed := range attacker.Speeds() {
		if speedType == model.Flying && speed.Feet > 30 {
			damage += 2
		}
	}
	// the defender shrugs off the worst of it
	for damage > 20 {
		damage -= 5
	}
	switch terrain {
	case "cellar":
		damage += 1
	case "dungeon":
		damage += 2
	case "lair":
		damage -= 1
	default:
		damage += 0
	}
	/* Go has no conditional expression,
	   the if statement below stands in for the ternary. */
	total := damage
	if defender.ArmorClass().Total() > 15 {
		total = damage / 2
	}
	r.critical = roll == 20 || bonus > 5
	// total = total * 2
	r.rounds++
	return total // never negative
}

func (r *EncounterResolver) Describe(creature *model.Creature) string {
	rested := creature.HitPoints().Rest().TakeDamage(1).TakeDamage(2).Rest()
	wounded := creature.HitPoints().TakeDamage(3).Rest()
	return fmt.Sprintf("%d of %d hit points", wounded.Current, rested.Max)
}

func (r *EncounterResolver) SafeRoll(dice model.Dice) (result int) {
	// recover in a deferred closure is the catch of Go
	defer func() {
		if recovered := recover(); recovered != nil {
			result = 1
		}
	}()
	defer fmt.Println("roll finished")
	clamp := func(value int) int {
		if value > 20 {
			return 20
		}
		return value
	}
	return clamp(dice.Roll().Result)
}

func (r *EncounterResolver) InitiativeOrder(creatures []*model.Creature) []*model.Creature {
	initiativeOf := func(creature *model.Creature) int {
		return creature.RollInitiative().Result
	}
	if len(creatures) < 2 {
		return creatures
	}
	rest := r.InitiativeOrder(creatures[1:])
	r.rounds += initiativeOf(creatures[0])
	return append(rest, creatures[0])
}

func (r *EncounterResolver) IsEmpty() bool {
	return r.rounds == 0
}
