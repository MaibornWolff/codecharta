package model

const MAX_HIT_POINTS = 999

// Hit points drop when the creature takes damage and recover when it rests in its lair.
type HitPoints struct {
	Current   int
	Max       int
	Temporary int
}

func InitHitPoints(max int) HitPoints {
	if max > MAX_HIT_POINTS {
		max = MAX_HIT_POINTS
	}
	return HitPoints{Current: max, Max: max, Temporary: 0}
}

func (hp HitPoints) TakeDamage(damage int) HitPoints {
	hp.Current -= damage
	if hp.Current < 0 {
		hp.Current = 0
	}
	return hp
}

func (hp HitPoints) Rest() HitPoints {
	hp.Current = hp.Max
	return hp
}
