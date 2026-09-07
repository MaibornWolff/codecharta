package model

import "fmt"

type NoSuchCreatureException struct {
	Id CreatureId
}

func NewNoSuchCreatureException(id CreatureId) *NoSuchCreatureException {
	return &NoSuchCreatureException{Id: id}
}

func (e *NoSuchCreatureException) Error() string {
	return fmt.Sprintf("No such creature in the dungeon: %s", e.Id)
}
