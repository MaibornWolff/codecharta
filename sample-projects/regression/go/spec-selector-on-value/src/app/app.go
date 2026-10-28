package app

import "example.com/m/model"

func Heal(creature *model.Creature) int { return creature.HitPoints() }
