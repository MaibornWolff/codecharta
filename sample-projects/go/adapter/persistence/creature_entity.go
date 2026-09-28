package persistence

type CreatureEntity struct {
	Id           string `db:"id"`
	CreatureType int    `db:"creature_type"`
}

func NewCreatureEntity(id string) CreatureEntity {
	return CreatureEntity{Id: id}
}

func (e CreatureEntity) Key() string {
	return e.Id
}
