package model

type CreatureType int

const (
	Monstrosity CreatureType = iota
	Beast
	Aberration
	Celestial
	Dragon
	Fiend
	Humanoid
	Undead
)

func (t CreatureType) String() string {
	return [...]string{"monstrosity", "beast", "aberration", "celestial", "dragon", "fiend", "humanoid", "undead"}[t]
}
