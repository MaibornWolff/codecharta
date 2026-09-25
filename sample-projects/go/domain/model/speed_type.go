package model

type SpeedType int

const (
	Walking SpeedType = iota
	Flying
	Swimming
	Burrowing
	Climbing
)

func AllSpeedTypes() []SpeedType {
	return []SpeedType{Walking, Flying, Swimming, Burrowing, Climbing}
}
