package model

import "github.com/google/uuid"

type CreatureId struct {
	Value string
}

func NewCreatureId() CreatureId {
	return CreatureId{Value: uuid.NewString()}
}

func CreatureIdOf(value string) CreatureId {
	return CreatureId{Value: value}
}

func (id CreatureId) String() string {
	return id.Value
}
