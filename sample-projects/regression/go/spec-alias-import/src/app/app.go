package app

import (
	"example.com/m/models"
	m2 "example.com/m/v2/models"
)

type App struct{ user m2.User }

func use() models.User { return models.User{} }
