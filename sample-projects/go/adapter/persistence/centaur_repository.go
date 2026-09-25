package persistence

import "de.sots/cellarsandcentaurs/domain/model"

type CentaurRepository struct {
	Repository[model.Centaur]
}

func NewCentaurRepository() *CentaurRepository {
	return &CentaurRepository{Repository: NewRepository[model.Centaur]()}
}
