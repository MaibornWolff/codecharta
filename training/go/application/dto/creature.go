package dto

type Creature struct {
	Id             string `json:"id"`
	Type           int    `json:"type"`
	HitPoints      int    `json:"hitPoints"`
	WalkingSpeed   int    `json:"walkingSpeed"`
	FlyingSpeed    int    `json:"flyingSpeed"`
	SwimmingSpeed  int    `json:"swimmingSpeed"`
	BurrowingSpeed int    `json:"burrowingSpeed"`
	ClimbingSpeed  int    `json:"climbingSpeed"`
	Stable         string `json:"stable"`
}
